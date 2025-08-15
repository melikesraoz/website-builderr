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
  const { 
    url, 
    name, 
    description, 
    address, 
    phone, 
    email, 
    rooms, 
    logo,
    website,
    facebook,
    instagram,
    twitter,
    linkedin,
    youtube,
    whatsapp,
    checkIn,
    checkOut,
    amenities,
    priceRange,
    starRating
  } = req.body;

  if (!url || !name) {
    return res.status(400).json({ message: 'URL ve otel adı gereklidir.' });
  }

  if (!address || !phone || !email) {
    return res.status(400).json({ message: 'Adres, telefon ve email bilgileri gereklidir.' });
  }

  try {
    console.log(`🔗 URL'den veri çekiliyor: ${url}`);
    console.log(`📝 Otel bilgileri:`, { 
      name, 
      address, 
      phone, 
      email, 
      rooms, 
      description,
      website,
      facebook,
      instagram,
      twitter,
      linkedin,
      youtube,
      whatsapp,
      checkIn,
      checkOut,
      amenities,
      priceRange,
      starRating
    });

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

    // 4. Gelişmiş HTML İçerik Değiştirme
    console.log('🔧 HTML içeriği işleniyor...');
    
    // Tüm text node'ları işle
    $('*').each((_, el) => {
      const $el = $(el);
      const text = $el.text();
      
      // Sadece text içeren elementleri işle
      if (text && text.trim().length > 0 && !$el.find('*').length) {
        let newText = text;
        let changed = false;
        
        // Otel adı değiştirme
        if (name && text.length > 3) {
          const hotelPatterns = [
            /(?:Grand\s+)?(?:Hotel|Otel|Resort|Motel|Inn)\s+[A-Za-zçğıöşüÇĞIİÖŞÜ\s]+/gi,
            /[A-Za-zçğıöşüÇĞIİÖŞÜ\s]+(?:Hotel|Otel|Resort|Motel|Inn)/gi,
            /(?:Hilton|Marriott|Sheraton|Hyatt|Ritz|Waldorf|Four\s+Seasons)\s+[A-Za-zçğıöşüÇĞIİÖŞÜ\s]*/gi
          ];
          
          hotelPatterns.forEach(pattern => {
            if (pattern.test(newText)) {
              newText = newText.replace(pattern, name);
              changed = true;
              console.log('🏨 Otel adı değiştirildi:', text, '→', newText);
            }
          });
        }
        
        // Telefon numarası değiştirme
        if (phone && text.length > 5) {
          const phonePatterns = [
            /\+?[0-9\s\-\(\)\.]{10,}/g,
            /[0-9]{3}[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{2}[\s\-\.]?[0-9]{2}/g,
            /[0-9]{4}[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{2}[\s\-\.]?[0-9]{2}/g
          ];
          
          phonePatterns.forEach(pattern => {
            if (pattern.test(newText)) {
              newText = newText.replace(pattern, phone);
              changed = true;
              console.log('📞 Telefon değiştirildi:', text, '→', newText);
            }
          });
        }
        
        // Email değiştirme
        if (email && text.includes('@')) {
          const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          if (emailPattern.test(newText)) {
            newText = newText.replace(emailPattern, email);
            changed = true;
            console.log('✉️ Email değiştirildi:', text, '→', newText);
          }
        }
        
        // Adres değiştirme
        if (address && text.length > 10) {
          const addressKeywords = ['adres', 'address', 'konum', 'location', 'cadde', 'sokak', 'mahalle'];
          const hasAddressKeyword = addressKeywords.some(keyword => 
            text.toLowerCase().includes(keyword)
          );
          
          if (hasAddressKeyword) {
            newText = newText.replace(/[A-Za-zçğıöşüÇĞIİÖŞÜ\s,\.\-0-9]+(?:adres|address|konum|location|cadde|sokak|mahalle)[A-Za-zçğıöşüÇĞIİÖŞÜ\s,\.\-0-9]*/gi, address);
            changed = true;
            console.log('📍 Adres değiştirildi:', text, '→', newText);
          }
        }
        
        // Değişiklik varsa uygula
        if (changed) {
          $el.text(newText);
        }
      }
    });
    
    // Logo değiştirme
    if (logo) {
      $('img').each((_, el) => {
        const $img = $(el);
        const src = $img.attr('src') || '';
        const alt = $img.attr('alt') || '';
        const title = $img.attr('title') || '';
        
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

    // 5. Website keys'leri tanımla ve son temizlik
    let processedHTML = $.html();
    
    // Website keys değiştirme
    processedHTML = processedHTML
      .replace(/{{name}}/g, name)
      .replace(/{{address}}/g, address)
      .replace(/{{phone}}/g, phone)
      .replace(/{{email}}/g, email)
      .replace(/{{description}}/g, description || '')
      .replace(/{{rooms}}/g, rooms || '')
      .replace(/{{logo}}/g, logo || '')
      .replace(/{{website}}/g, website || '')
      .replace(/{{facebook}}/g, facebook || '')
      .replace(/{{instagram}}/g, instagram || '')
      .replace(/{{twitter}}/g, twitter || '')
      .replace(/{{linkedin}}/g, linkedin || '')
      .replace(/{{youtube}}/g, youtube || '')
      .replace(/{{whatsapp}}/g, whatsapp || '')
      .replace(/{{checkIn}}/g, checkIn || '')
      .replace(/{{checkOut}}/g, checkOut || '')
      .replace(/{{amenities}}/g, amenities || '')
      .replace(/{{priceRange}}/g, priceRange || '')
      .replace(/{{starRating}}/g, starRating ? '⭐'.repeat(parseInt(starRating)) : '');
    
    // Ek metin değiştirme (regex ile) - Daha agresif
    const replacements = [
      // Otel adı değiştirme - Çok agresif
      { pattern: /(?:Grand\s+)?(?:Hotel|Otel|Resort|Motel|Inn)\s+[A-Za-zçğıöşüÇĞIİÖŞÜ\s]+/gi, replacement: name },
      { pattern: /[A-Za-zçğıöşüÇĞIİÖŞÜ\s]+(?:Hotel|Otel|Resort|Motel|Inn)/gi, replacement: name },
      { pattern: /(?:Hilton|Marriott|Sheraton|Hyatt|Ritz|Waldorf|Four\s+Seasons)\s+[A-Za-zçğıöşüÇĞIİÖŞÜ\s]*/gi, replacement: name },
      { pattern: /<h[1-6][^>]*>[^<]*[A-Za-zçğıöşüÇĞIİÖŞÜ\s]+[^<]*<\/h[1-6]>/gi, replacement: `<h1>${name}</h1>` },
      { pattern: /<title>[^<]*<\/title>/gi, replacement: `<title>${name}</title>` },
      
      // Telefon değiştirme - Çok agresif
      { pattern: /\+?[0-9\s\-\(\)\.]{10,}/g, replacement: phone },
      { pattern: /tel:[\+]?[0-9\s\-\(\)\.]+/gi, replacement: `tel:${phone}` },
      { pattern: /[0-9]{3}[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{2}[\s\-\.]?[0-9]{2}/g, replacement: phone },
      { pattern: /[0-9]{4}[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{2}[\s\-\.]?[0-9]{2}/g, replacement: phone },
      
      // Email değiştirme - Çok agresif
      { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: email },
      { pattern: /mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, replacement: `mailto:${email}` },
      
      // Adres değiştirme - Çok agresif
      { pattern: /(?:Adres|Address|Konum|Location)[\s:]*[A-Za-zçğıöşüÇĞIİÖŞÜ0-9\s,\.\-]+/gi, replacement: `Adres: ${address}` },
      { pattern: /[A-Za-zçğıöşüÇĞIİÖŞÜ\s,\.\-]+(?:cadde|caddesi|sokak|sokağı|mahalle|mahallesi|bulvar|bulvarı)/gi, replacement: address },
      
      // Sosyal medya linkleri
      { pattern: /https?:\/\/(www\.)?facebook\.com\/[^\s"']+/gi, replacement: facebook || '#' },
      { pattern: /https?:\/\/(www\.)?instagram\.com\/[^\s"']+/gi, replacement: instagram || '#' },
      { pattern: /https?:\/\/(www\.)?twitter\.com\/[^\s"']+/gi, replacement: twitter || '#' },
      { pattern: /https?:\/\/(www\.)?linkedin\.com\/[^\s"']+/gi, replacement: linkedin || '#' },
      { pattern: /https?:\/\/(www\.)?youtube\.com\/[^\s"']+/gi, replacement: youtube || '#' },
      
      // WhatsApp
      { pattern: /https?:\/\/wa\.me\/[0-9]+/gi, replacement: whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` : '#' },
      { pattern: /tel:[+]?[0-9\s\-\(\)\.]+/gi, replacement: `tel:${phone}` },
    ];
    
    replacements.forEach(({ pattern, replacement }) => {
      if (replacement && replacement !== '#') {
        processedHTML = processedHTML.replace(pattern, replacement);
        console.log('🔄 Regex değiştirme uygulandı:', pattern.source);
      }
    });
    
    console.log('✅ HTML işleme tamamlandı');
    console.log('📄 İşlenmiş HTML boyutu:', processedHTML.length, 'karakter');
    console.log('🔍 HTML içinde değişiklikler:');
    console.log('  - Otel adı:', processedHTML.includes(name) ? '✅ Bulundu' : '❌ Bulunamadı');
    console.log('  - Telefon:', processedHTML.includes(phone) ? '✅ Bulundu' : '❌ Bulunamadı');
    console.log('  - Email:', processedHTML.includes(email) ? '✅ Bulundu' : '❌ Bulunamadı');
    console.log('  - Adres:', processedHTML.includes(address) ? '✅ Bulundu' : '❌ Bulunamadı');

    // 6. Production klasörüne kaydet
    const dirPath = path.join(__dirname, '..', 'productiondir', name);
    fs.mkdirSync(dirPath, { recursive: true });
    
    const outputPath = path.join(dirPath, 'index.html');
    fs.writeFileSync(outputPath, processedHTML, 'utf-8');

    // 7. Veritabanına kaydet
    const newHotel = new Hotel({
      name,
      description: description || 'URL ile klonlanmış site',
      address,
      phone,
      email,
      rooms,
      logo,
      website,
      facebook,
      instagram,
      twitter,
      linkedin,
      youtube,
      whatsapp,
      checkIn,
      checkOut,
      amenities,
      priceRange,
      starRating,
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
