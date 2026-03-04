const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check & Root Route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Uber Clone Backend is running' });
});

module.exports = app;
