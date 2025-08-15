const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  rooms: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  facebook: {
    type: String,
    default: ''
  },
  instagram: {
    type: String,
    default: ''
  },
  twitter: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  youtube: {
    type: String,
    default: ''
  },
  whatsapp: {
    type: String,
    default: ''
  },
  checkIn: {
    type: String,
    default: ''
  },
  checkOut: {
    type: String,
    default: ''
  },
  amenities: {
    type: String,
    default: ''
  },
  priceRange: {
    type: String,
    default: ''
  },
  starRating: {
    type: String,
    default: ''
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  siteUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Hotel', hotelSchema);
