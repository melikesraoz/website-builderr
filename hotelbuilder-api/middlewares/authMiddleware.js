const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Authorization başlığı var mı ve 'Bearer ' ile mi başlıyor?
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Token eksik' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer TOKEN" yapısından sadece TOKEN'ı al

  try {
    // Token'ı çöz
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // İsteğe user bilgisini ekle (ileride lazım olabilir)
    req.user = decoded;

    next(); // Devam et
  } catch (err) {
    return res.status(401).json({ message: 'Geçersiz token' });
  }
};

module.exports = verifyToken;
