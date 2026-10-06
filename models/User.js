const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  role: { type: String, enum: ['CUSTOMER', 'WORKER', 'ADMIN'], default: 'CUSTOMER' },
  // Worker-specific fields (Electrician, Plumber, Carpenter)
  serviceCategory: { type: String, enum: ['ELECTRICAL', 'PLUMBING', 'CARPENTRY', 'NONE'], default: 'NONE' },
  isAvailable: { type: Boolean, default: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [79.7036, 12.8342] } // Default Kanchipuram Coordinates [lng, lat]
  }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' }); // For geospatial worker matching
module.exports = mongoose.model('User', userSchema);