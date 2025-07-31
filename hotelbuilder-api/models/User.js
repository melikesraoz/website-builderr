const mongoose = require('mongoose');

// 1. Şema (Schema) oluştur: Kullanıcı verisi nasıl görünecek?
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true // aynı email bir daha eklenemez
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true // createdAt ve updatedAt otomatik eklenir
});

// 2. Şemadan model oluştur
const User = mongoose.model('User', userSchema);

// 3. Dışa aktar
module.exports = User;
