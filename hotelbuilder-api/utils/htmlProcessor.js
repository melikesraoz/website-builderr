const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function stringifyValue(val) {
  if (val == null) return '';
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function replaceAllSafe(str, placeholder, value) {
  // Node sürümüne takılmamak için global regex
  const rx = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  return str.replace(rx, value);
}

// Windows/Unix uyumlu, boşluk–özel karakter temiz klasör adı
function safeDirName(name) {
  return String(name)
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

// HTML şablon işleyici fonksiyon
function generateHTML(templateName, data) {
  const templatePath = path.join(__dirname, '..', 'designdir', templateName);
  const outputDir = path.join(__dirname, '..', 'productiondir');

  try {
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Şablon dosyası bulunamadı: ${templateName}`);
    }

    // productiondir yoksa oluştur
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let template = fs.readFileSync(templatePath, 'utf-8');

    // {{key}} placeholder'larını doldur
    Object.keys(data || {}).forEach((key) => {
      const placeholder = `{{${key}}}`;
      const value = stringifyValue(data[key]);
      template = replaceAllSafe(template, placeholder, value);
    });

    const fileName = `site-${uuidv4().slice(0, 8)}.html`;
    const outputPath = path.join(outputDir, fileName);

    fs.writeFileSync(outputPath, template, 'utf-8');
    return fileName;
  } catch (err) {
    console.error('HTML oluşturma hatası:', err);
    return null;
  }
}

module.exports = { generateHTML, safeDirName };
