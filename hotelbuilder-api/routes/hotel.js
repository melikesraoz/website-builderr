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
  const { url, name, description, address, phone, email, rooms, logo } = req.body;

  if (!url || !name) {
    return res.status(400).json({ message: 'URL ve otel adı gereklidir.' });
  }

  if (!address || !phone || !email) {
    return res.status(400).json({ message: 'Adres, telefon ve email bilgileri gereklidir.' });
  }

  try {
    console.log(`🔗 URL'den veri çekiliyor: ${url}`);
    console.log(`📝 Otel bilgileri:`, { name, address, phone, email, rooms, description });

    // 1. HTML verisini çek
    const htmlResponse = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const rawHTML = htmlResponse.data;
    console.log(`📄 HTML verisi alındı (${rawHTML.length} karakter)`);

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

    // 3.5. Gelişmiş HTML İçerik Değiştirme
    console.log('🔧 HTML içeriği işleniyor...');
    
    // Tüm metin içeren elementleri işle
    $('*').each((_, el) => {
      const $el = $(el);
      let text = $el.text();
      let html = $el.html();
      let changed = false;
      
      // Otel adı değiştirme (en yaygın pattern'ler)
      const hotelNamePatterns = [
        /(?:otel|hotel|resort|motel|inn)\s+[A-Za-zçğıöşüÇĞIİÖŞÜ\s]+/gi,
        /[A-Za-zçğıöşüÇĞIİÖŞÜ\s]+(?:otel|hotel|resort|motel|inn)/gi,
        /<h[1-6][^>]*>[^<]*[A-Za-zçğıöşüÇĞIİÖŞÜ\s]+[^<]*<\/h[1-6]>/gi
      ];
      
      hotelNamePatterns.forEach(pattern => {
        if (pattern.test(text)) {
          text = text.replace(pattern, name);
          html = html.replace(pattern, name);
          changed = true;
        }
      });
      
      // Telefon numarası değiştirme (daha kapsamlı)
      const phonePatterns = [
        /\+?[0-9\s\-\(\)\.]{10,}/g,
        /[0-9]{3}[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{2}[\s\-\.]?[0-9]{2}/g,
        /[0-9]{4}[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{2}[\s\-\.]?[0-9]{2}/g,
        /[0-9]{2}[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{2}[\s\-\.]?[0-9]{2}/g,
        /tel:[\+]?[0-9\s\-\(\)\.]+/gi
      ];
      
      phonePatterns.forEach(pattern => {
        if (pattern.test(text)) {
          text = text.replace(pattern, phone);
          html = html.replace(pattern, phone);
          changed = true;
        }
      });
      
      // Email değiştirme
      const emailPatterns = [
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        /mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi
      ];
      
      emailPatterns.forEach(pattern => {
        if (pattern.test(text)) {
          text = text.replace(pattern, email);
          html = html.replace(pattern, email);
          changed = true;
        }
      });
      
      // Adres değiştirme (daha kapsamlı)
      const addressPatterns = [
        /(?:adres|address|konum|location|adresi|addresses)[\s:]*[A-Za-zçğıöşüÇĞIİÖŞÜ0-9\s,\.\-]+/gi,
        /[A-Za-zçğıöşüÇĞIİÖŞÜ\s,\.\-]+(?:cadde|caddesi|sokak|sokağı|mahalle|mahallesi|bulvar|bulvarı)/gi
      ];
      
      addressPatterns.forEach(pattern => {
        if (pattern.test(text)) {
          text = text.replace(pattern, address);
          html = html.replace(pattern, address);
          changed = true;
        }
      });
      
      // Oda sayısı değiştirme
      if (rooms) {
        const roomPatterns = [
          /(?:oda|room|bedroom)[\s:]*[0-9]+/gi,
          /[0-9]+[\s]*(?:oda|room|bedroom)/gi
        ];
        
        roomPatterns.forEach(pattern => {
          if (pattern.test(text)) {
            text = text.replace(pattern, `${rooms} oda`);
            html = html.replace(pattern, `${rooms} oda`);
            changed = true;
          }
        });
      }
      
      // Açıklama değiştirme (title, meta description, h1-h6)
      if (description) {
        const descPatterns = [
          /<title>[^<]*<\/title>/gi,
          /<meta[^>]*name="description"[^>]*content="[^"]*"[^>]*>/gi,
          /<h[1-6][^>]*>[^<]*<\/h[1-6]>/gi
        ];
        
        descPatterns.forEach(pattern => {
          if (pattern.test(html)) {
            html = html.replace(pattern, description);
            changed = true;
          }
        });
      }
      
      // Değişiklik varsa uygula
      if (changed) {
        $el.html(html);
      }
    });
    
    // Logo değiştirme (daha kapsamlı)
    if (logo) {
      $('img').each((_, el) => {
        const $img = $(el);
        const src = $img.attr('src') || '';
        const alt = $img.attr('alt') || '';
        const title = $img.attr('title') || '';
        
        // Logo içeren resimleri değiştir
        if (src.toLowerCase().includes('logo') || 
            alt.toLowerCase().includes('logo') || 
            title.toLowerCase().includes('logo') ||
            src.toLowerCase().includes('brand') ||
            alt.toLowerCase().includes('brand')) {
          $img.attr('src', logo);
          console.log('🖼️ Logo değiştirildi:', src, '→', logo);
        }
      });
    }
    
    // Meta tag'leri güncelle
    $('meta[name="description"]').attr('content', description || name);
    $('meta[property="og:title"]').attr('content', name);
    $('meta[property="og:description"]').attr('content', description || name);
    $('title').text(name);
    
    // Schema.org yapılandırılmış veri güncelleme
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const $script = $(el);
        let jsonData = JSON.parse($script.html());
        
        if (jsonData['@type'] === 'Hotel' || jsonData['@type'] === 'LodgingBusiness') {
          jsonData.name = name;
          jsonData.description = description || jsonData.description;
          jsonData.address = address;
          jsonData.telephone = phone;
          jsonData.email = email;
          
          $script.html(JSON.stringify(jsonData, null, 2));
          console.log('🏨 Schema.org verisi güncellendi');
        }
      } catch (err) {
        // JSON parse hatası olursa atla
      }
    });

    // 4. Website keys'leri tanımla ve son temizlik
    let processedHTML = $.html();
    
    // Website keys değiştirme
    processedHTML = processedHTML
      .replace(/{{name}}/g, name)
      .replace(/{{address}}/g, address)
      .replace(/{{phone}}/g, phone)
      .replace(/{{email}}/g, email)
      .replace(/{{description}}/g, description || '')
      .replace(/{{rooms}}/g, rooms || '')
      .replace(/{{logo}}/g, logo || '');
    
    // Ek metin değiştirme (regex ile)
    const replacements = [
      // Otel adı değiştirme
      { pattern: /(?:Grand\s+)?(?:Hotel|Otel|Resort|Motel|Inn)\s+[A-Za-zçğıöşüÇĞIİÖŞÜ\s]+/gi, replacement: name },
      { pattern: /[A-Za-zçğıöşüÇĞIİÖŞÜ\s]+(?:Hotel|Otel|Resort|Motel|Inn)/gi, replacement: name },
      
      // Telefon değiştirme
      { pattern: /\+?[0-9\s\-\(\)\.]{10,}/g, replacement: phone },
      { pattern: /tel:[\+]?[0-9\s\-\(\)\.]+/gi, replacement: `tel:${phone}` },
      
      // Email değiştirme
      { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: email },
      { pattern: /mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, replacement: `mailto:${email}` },
      
      // Adres değiştirme
      { pattern: /(?:Adres|Address|Konum|Location)[\s:]*[A-Za-zçğıöşüÇĞIİÖŞÜ0-9\s,\.\-]+/gi, replacement: `Adres: ${address}` },
    ];
    
    replacements.forEach(({ pattern, replacement }) => {
      processedHTML = processedHTML.replace(pattern, replacement);
    });
    
    console.log('✅ HTML işleme tamamlandı');

    // 5. Production klasörüne kaydet
    const dirPath = path.join(__dirname, '..', 'productiondir', name);
    fs.mkdirSync(dirPath, { recursive: true });
    
    const outputPath = path.join(dirPath, 'index.html');
    fs.writeFileSync(outputPath, processedHTML, 'utf-8');

    // 6. Veritabanına kaydet
    const newHotel = new Hotel({
      name,
      description: description || 'URL ile klonlanmış site',
      address,
      phone,
      email,
      rooms,
      logo,
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
