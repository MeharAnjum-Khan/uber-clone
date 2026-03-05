const { Pool } = require('pg');
const Stripe = require('stripe');

// Initialize Pool
const pool = new Pool();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Service: Create Payment Intent
 * Creates a Stripe PaymentIntent and records it in the database.
 */
const createPaymentIntent = async (userId, rideId, amountDecimal, currency = 'usd') => {
  // 1. Convert amount to integer (cents) for Stripe
  // ensure amount is a number
  const amount = parseFloat(amountDecimal);
  if (isNaN(amount)) {
    throw new Error('Invalid amount');
  }
  
  const amountInCents = Math.round(amount * 100);

  // 2. Create PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: currency,
    metadata: {
      rideId: rideId,
      userId: userId,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // 3. Insert into database
  const query = `
    INSERT INTO payments (ride_id, user_id, amount, currency, status, stripe_payment_intent_id, created_at)
    VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
    RETURNING *;
  `;
  const values = [rideId, userId, amount, currency, paymentIntent.id];

  const { rows } = await pool.query(query, values);

  return {
    client_secret: paymentIntent.client_secret,
    payment: rows[0],
  };
};

/**
 * Service: Handle Webhook Event
 * Verifies signature and updates database on success.
 */
const handleWebhookEvent = async (signature, rawBody) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const stripePaymentId = paymentIntent.id;

      // Update database status to 'completed'
      const query = `
        UPDATE payments
        SET status = 'completed'
        WHERE stripe_payment_intent_id = $1
        RETURNING *;
      `;
      const values = [stripePaymentId];
      
      const { rows } = await pool.query(query, values);
      
      if (rows.length === 0) {
        console.warn(`Payment record not found for intent: ${stripePaymentId}`);
      } else {
        console.log(`Payment confirmed for ride: ${rows[0].ride_id}`);
      }
      break;
      
    // Handle other event types if needed (e.g. payment_intent.payment_failed)
    case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        await pool.query(
            "UPDATE payments SET status = 'failed' WHERE stripe_payment_intent_id = $1", 
            [failedIntent.id]
        );
        break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { received: true };
};

/**
 * Service: Get Payment History
 */
const getPaymentHistory = async (userId) => {
  const query = `
    SELECT * FROM payments
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;
  const values = [userId];

  const { rows } = await pool.query(query, values);
  return rows;
};

module.exports = {
  createPaymentIntent,
  handleWebhookEvent,
  getPaymentHistory,
};
