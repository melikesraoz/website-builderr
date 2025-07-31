const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// HTML şablon işleyici fonksiyon
function generateHTML(templateName, data) {
  const templatePath = path.join(__dirname, '..', 'designdir', templateName);
  const outputDir = path.join(__dirname, '..', 'productiondir');

  try {
    // 1. Şablonu oku
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Şablon dosyası bulunamadı: ${templateName}`);
    }

    let template = fs.readFileSync(templatePath, 'utf-8');

    // 2. Verileri {{key}} ile değiştir
    Object.keys(data).forEach((key) => {
      const placeholder = `{{${key}}}`;
      template = template.replaceAll(placeholder, data[key] || '');
    });

    // 3. UUID ile dosya ismi üret
    const fileName = `site-${uuidv4().slice(0, 8)}.html`;
    const outputPath = path.join(outputDir, fileName);

    // 4. Dosyayı yaz
    fs.writeFileSync(outputPath, template, 'utf-8');

    return fileName;
  } catch (err) {
    console.error('HTML oluşturma hatası:', err.message);
    return null;
  }
}

module.exports = { generateHTML };
