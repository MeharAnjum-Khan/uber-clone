const paymentsService = require('../services/payments.service');

const createIntent = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const userId = req.user.id;
    const { rideId, amount, currency } = req.body;

    if (!rideId || !amount) {
      return res.status(400).json({ error: 'rideId and amount are required' });
    }

    const result = await paymentsService.createPaymentIntent(userId, rideId, amount, currency);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Create Intent Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    // req.body should be the raw buffer here because of the route-specific middleware
    await paymentsService.handleWebhookEvent(signature, req.body);
    
    // Return a 200 response to acknowledge receipt of the event
    res.status(200).send({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    // Stripe expects a 400 if signature fails, or 500 if server error
    if (error.message.includes('signature verification failed')) {
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }
    res.status(500).send(`Server Error: ${error.message}`);
  }
};

const getHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const userId = req.user.id;

    const history = await paymentsService.getPaymentHistory(userId);
    res.json(history);
  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createIntent,
  handleWebhook,
  getHistory,
};
