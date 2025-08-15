const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS ayarları
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Log middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('WebSnap Backend Çalışıyor 🚀');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server test route çalışıyor!' });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hotel', require('./routes/hotel'));

// Static files
app.use('/static', express.static(path.join(__dirname, 'productiondir')));
app.use('/productiondir', express.static(path.join(__dirname, 'productiondir')));

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/websnap';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB bağlantısı başarılı!');
    app.listen(PORT, () => {
      console.log(`🚀 Server ${PORT} portunda çalışıyor`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB bağlantı hatası:', err);
    process.exit(1);
  });
