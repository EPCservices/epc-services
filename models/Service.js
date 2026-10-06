const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  category: { type: String, enum: ['ELECTRICAL', 'PLUMBING', 'CARPENTRY'], required: true },
  title: { type: String, required: true }, // e.g., "Fan Installation"
  price: { type: Number, required: true }, // e.g., 150
  description: { type: String },
  estimatedTime: { type: String } // e.g., "30 mins"
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);