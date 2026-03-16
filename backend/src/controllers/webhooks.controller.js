const { Webhook } = require('svix');
const usersService = require('../services/users.service');

/**
 * Clerk Webhook Handler
 * Verifies the Svix signature using CLERK_WEBHOOK_SECRET, then syncs user data into our DB.
 */
const handleClerkWebhook = async (req, res) => {
  try {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      console.error('CLERK_WEBHOOK_SECRET is not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    const payload = req.body; // Buffer from express.raw
    const headers = {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    };

    if (!headers['svix-id'] || !headers['svix-timestamp'] || !headers['svix-signature']) {
      console.warn('Missing Svix headers on Clerk webhook');
      return res.status(400).send('Missing headers');
    }

    let event;
    try {
      const wh = new Webhook(secret);
      event = wh.verify(payload, headers);
    } catch (err) {
      console.error('Clerk webhook signature verification failed', err);
      return res.status(400).send('Invalid signature');
    }

    const eventType = event.type;
    const payloadData = event.data || event;

    if (!eventType || !eventType.startsWith('user.')) {
      // Only handle user.* events
      return res.status(200).send('ignored');
    }

    const user = payloadData;
    if (!user || !user.id) {
      console.warn('Verified Clerk webhook but no user object found');
      return res.status(200).send('ignored');
    }

    const email = (user.email_addresses && user.email_addresses[0] && (user.email_addresses[0].email_address || user.email_addresses[0].email))
      || user.email
      || (user.primary_email_address && user.primary_email_address.email_address)
      || null;

    const name = user.name
      || ((user.first_name || user.firstName) ? `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() : null)
      || user.full_name
      || user.fullName
      || null;

    const phone = user.phone_number || user.phone || null;

    await usersService.syncUser({ id: user.id, email, name, phone });
    return res.status(200).send('ok');
  } catch (error) {
    console.error('Clerk webhook handler error', error);
    return res.status(500).send('server error');
  }
};

module.exports = {
  handleClerkWebhook,
};
