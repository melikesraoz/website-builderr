const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const Hotel = require('../models/Hotel');
const { generateHTML } = require('../utils/htmlProcessor');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Hotel routes çalışıyor!' });
});

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

// POST /api/hotel/generate/from-url
router.post('/generate/from-url', verifyToken, async (req, res) => {
  const { url, name } = req.body;

  if (!url || !name) {
    return res.status(400).json({ message: 'URL ve otel adı gereklidir.' });
  }

  try {
    console.log(`🔗 URL'den veri çekiliyor: ${url}`);

    // 1. HTML verisini çek
    const htmlResponse = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const rawHTML = htmlResponse.data;

    // 2. Cheerio ile parse et
    const $ = cheerio.load(rawHTML);

    // 3. Asset path'lerini düzelt
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !src.startsWith('http')) {
        const absoluteUrl = new URL(src, url).href;
        $(el).attr('src', absoluteUrl);
      }
    });

    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('http')) {
        const absoluteUrl = new URL(href, url).href;
        $(el).attr('href', absoluteUrl);
      }
    });

    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !src.startsWith('http')) {
        const absoluteUrl = new URL(src, url).href;
        $(el).attr('src', absoluteUrl);
      }
    });

    // 4. Website keys'leri tanımla ({{name}}, {{address}} gibi)
    const processedHTML = $.html()
      .replace(/{{name}}/g, name)
      .replace(/{{address}}/g, 'Otel Adresi')
      .replace(/{{phone}}/g, '+90 555 123 4567')
      .replace(/{{email}}/g, 'info@otel.com');

    // 5. Production klasörüne kaydet
    const dirPath = path.join(__dirname, '..', 'productiondir', name);
    fs.mkdirSync(dirPath, { recursive: true });
    
    const outputPath = path.join(dirPath, 'index.html');
    fs.writeFileSync(outputPath, processedHTML, 'utf-8');

    // 6. Veritabanına kaydet
    const newHotel = new Hotel({
      name,
      description: 'URL ile klonlanmış site',
      address: 'Otel Adresi',
      phone: '+90 555 123 4567',
      email: 'info@otel.com',
      ownerId: req.user.userId,
      siteUrl: `/productiondir/${name}/index.html`
    });

    await newHotel.save();

    console.log(`✅ Site başarıyla klonlandı: ${name}`);

    res.status(201).json({
      success: true,
      message: 'Site başarıyla klonlandı!',
      fileName: `${name}/index.html`,
      fileUrl: `/productiondir/${name}/index.html`,
      siteUrl: `http://localhost:5000/productiondir/${name}/index.html`
    });

  } catch (err) {
    console.error('❌ URL klonlama hatası:', err.message);
    res.status(500).json({ 
      error: 'Veri çekilemedi veya URL hatalı.',
      details: err.message 
    });
  }
});

module.exports = router;
