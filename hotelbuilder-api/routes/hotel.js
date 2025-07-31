const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const Hotel = require('../models/Hotel');
const { generateHTML } = require('../utils/htmlProcessor'); // ✔️ destructure ettik

// POST /api/hotel/create
router.post('/create', verifyToken, async (req, res) => {
  const { name, logo, description, address, phone, email, rooms } = req.body;

  try {
    const newHotel = new Hotel({
      name,
      logo,
      description,
      address,
      phone,
      email,
      rooms,
      ownerId: req.user.userId
    });

    await newHotel.save();

    res.status(201).json({ message: 'Otel başarıyla eklendi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// GET /api/hotel/my-hotels
router.get('/my-hotels', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const hotels = await Hotel.find({ ownerId: userId });
    res.status(200).json({ hotels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// POST /api/hotel/generate
router.post('/generate', verifyToken, async (req, res) => {
  const { templateName = 'template1.html', data } = req.body;

  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'Geçersiz veri formatı' });
    }

    const fileName = generateHTML(templateName, data);

    if (!fileName) {
      return res.status(500).json({ message: 'HTML dosyası oluşturulamadı.' });
    }

    const fileUrl = `/static/${fileName}`;

    res.status(201).json({
      message: 'Site başarıyla oluşturuldu!',
      fileName,
      fileUrl
    });
  } catch (err) {
    console.error('❌ HTML oluşturma hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
