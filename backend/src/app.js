const express = require('express');
const cors = require('cors');
const paymentsRoutes = require('./routes/payments.routes');

const app = express();

// Middleware
app.use(cors());

// Webhook handling - must be before express.json()
// The payments router has its own specific parser for the webhook route
app.use('/payments', paymentsRoutes);

app.use(express.json());

// Health Check & Root Route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Uber Clone Backend is running' });
});

module.exports = app;
