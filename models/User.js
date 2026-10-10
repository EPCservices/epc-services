const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['CUSTOMER', 'WORKER', 'ADMIN', 'customer', 'partner', 'admin'], default: 'CUSTOMER' },
  
  // District & Statewide Fields
  district: { type: String, required: true, index: true },
  pincode: { type: String, index: true },
  designation: { type: String, default: '' },
  
  // Worker Specific Fields
  serviceCategory: { type: String, enum: ['ELECTRICAL', 'PLUMBING', 'CARPENTRY', 'NONE'], default: 'NONE' },
  isAvailable: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  
  // Live GPS Tracking
  liveLat: { type: Number, default: 0 },
  liveLng: { type: Number, default: 0 },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [79.7036, 12.8342] } // Default [lng, lat]
  }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);