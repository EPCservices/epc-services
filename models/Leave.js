const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  partnerId: {
    type: String,
    required: true
  },
  partnerName: {
    type: String,
    required: true
  },
  type: {
    type: String, // 'Full Day Leave', 'Half Day Leave', 'Permission (2 Hours)'
    required: true
  },
  date: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Pending' // 'Pending', 'Approved', 'Rejected'
  },
  adminComment: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);