const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// Get all services or filter by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) {
      query.category = category.toUpperCase();
    }
    const services = await Service.find(query);
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new service (Admin use)
router.post('/add', async (req, res) => {
  try {
    const newService = new Service(req.body);
    await newService.save();
    res.status(201).json({ message: 'Service added successfully', newService });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;