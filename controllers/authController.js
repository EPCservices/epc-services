const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Login or Signup using Phone Number
exports.phoneLogin = async (req, res) => {
  try {
    const { phone, role, name, serviceCategory } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({ phone, role: role || 'CUSTOMER', name: name || 'User', serviceCategory: serviceCategory || 'NONE' });
      await user.save();
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};