const express = require('express');
const cors = require('cors');
const paymentsRoutes = require('./routes/payments.routes');
const ratingsRoutes = require('./routes/ratings.routes');
const sosRoutes = require('./routes/sos.routes');
const messagesRoutes = require('./routes/messages.routes');
const promoRoutes = require('./routes/promo.routes');

const app = express();

// Middleware
app.use(cors());

// Webhook handling - must be before express.json()
// The payments router has its own specific parser for the webhook route
app.use('/payments', paymentsRoutes);

app.use(express.json());

// Routes
app.use('/ratings', ratingsRoutes);
app.use('/sos', sosRoutes);
app.use('/messages', messagesRoutes);
app.use('/promo-codes', promoRoutes);

// Health Check & Root Route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Uber Clone Backend is running' });
});

module.exports = app;
