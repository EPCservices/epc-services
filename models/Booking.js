const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  services: [{
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    quantity: { type: Number, default: 1 },
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  address: {
    street: String,
    landmark: String,
    pincode: { type: String, default: '631501' }, // Kanchipuram Pincode
    coordinates: [Number] // [lng, lat]
  },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  razorpayOrderId: String,
  scheduledTime: String,
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);