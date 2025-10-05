const express = require('express');
const cors = require('cors');
require('dotenv').config();

const travelRoutes = require('./routes/travel');
const agricultureRoutes = require('./routes/agriculture');
const solarRoutes = require('./routes/solar');
const riskRoutes = require('./routes/risk');

const app = express();
const PORT = process.env.PORT || 5000;

// Simple CORS for production - allow all origins
app.use(cors({
  origin: true, // Allow all origins in production
  credentials: true
}));

// Middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/travel', travelRoutes);
app.use('/api/agriculture', agricultureRoutes);
app.use('/api/solar', solarRoutes);
app.use('/api/risk', riskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'NASA Climate Assistant API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'NASA Climate Assistant API',
    status: 'operational',
    documentation: '/api/health'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NASA Climate Assistant Backend Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'production'}`);
});