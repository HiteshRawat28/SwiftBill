const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const lookupRoutes = require('./routes/lookup.routes');
const partyRoutes = require('./routes/party.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/lookups', lookupRoutes);
app.use('/api/parties', partyRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_ERROR'
    }
  });
});

module.exports = app;
