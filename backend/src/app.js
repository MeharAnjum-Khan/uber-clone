const express = require('express');
const cors = require('cors');
const paymentsRoutes = require('./routes/payments.routes');
const webhooksRoutes = require('./routes/webhooks.routes');
const ratingsRoutes = require('./routes/ratings.routes');
const sosRoutes = require('./routes/sos.routes');
const messagesRoutes = require('./routes/messages.routes');
const promoRoutes = require('./routes/promo.routes');
const usersRoutes = require('./routes/users.routes');
const driversRoutes = require('./routes/drivers.routes');
const ridesRoutes = require('./routes/rides.routes');
const supportRoutes = require('./routes/support.routes');

const app = express();

// Middleware
app.use(cors());

// Webhook handling - must be before express.json()
// The payments router has its own specific parser for the webhook route
app.use('/payments', paymentsRoutes);
// Clerk & other webhook endpoints
app.use('/webhooks', webhooksRoutes);

app.use(express.json());

// Main App Routes
app.use('/users', usersRoutes);
app.use('/drivers', driversRoutes);
app.use('/rides', ridesRoutes);

// Other Module Routes
app.use('/ratings', ratingsRoutes);
app.use('/sos', sosRoutes);
app.use('/messages', messagesRoutes);
app.use('/promo-codes', promoRoutes);
app.use('/support', supportRoutes);

// Health Check & Root Route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Uber Clone Backend is running' });
});

module.exports = app;
