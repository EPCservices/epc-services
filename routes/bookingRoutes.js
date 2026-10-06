const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Create a new booking
router.post('/create', async (req, res) => {
  try {
    const { customer, services, totalAmount, address, scheduledTime } = req.body;

    const newBooking = new Booking({
      customer,
      services,
      totalAmount,
      address,
      scheduledTime,
      status: 'PENDING'
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bookings for a customer or worker
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ $or: [{ customer: userId }, { worker: userId }] })
      .populate('customer worker', 'name phone serviceCategory');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;