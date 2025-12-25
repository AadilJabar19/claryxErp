const express = require('express');
const db = require('./config/database');
const auth = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const salesRoutes = require('./routes/sales');
const purchaseRoutes = require('./routes/purchase');
const receiptRoutes = require('./routes/receipt');
const inventoryRoutes = require('./routes/inventory');
const reportsRoutes = require('./routes/reports');

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health/db', async (req, res) => {
  try {
    await db.raw('select 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'degraded', db: 'disconnected' });
  }
});

app.use('/api/sales', auth, salesRoutes);
app.use('/api/purchases', auth, purchaseRoutes);
app.use('/api/receipts', auth, receiptRoutes);
app.use('/api/inventory', auth, inventoryRoutes);
app.use('/api/reports', reportsRoutes);

app.use(errorHandler);

module.exports = app;