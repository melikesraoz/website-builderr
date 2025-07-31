const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // .env dosyasını yükle

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('WebSnap Backend Çalışıyor 🚀');
});

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas bağlantısı başarılı!');
      app.listen(5000, () => console.log('🚀 Server 5000 portunda çalışıyor.'));
  })
    .catch((err) => console.error('❌ MongoDB bağlantı hatası:', err));


const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const hotelRoutes = require('./routes/hotel');
app.use('/api/hotel', hotelRoutes);
