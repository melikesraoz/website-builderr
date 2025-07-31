const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  logo: String,
  description: String,
  address: String,
  phone: String,
  email: String,
  rooms: [
    {
      type: String
    }
  ],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hotel', hotelSchema);
