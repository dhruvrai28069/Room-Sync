const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const questionnaireRoutes = require('./routes/questionnaireRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Smart Hostel API',
    timestamp: new Date().toISOString()
  });
});

// Mount Smart Hostel API Routes
app.use('/api/auth', authRoutes);
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

module.exports = app;
