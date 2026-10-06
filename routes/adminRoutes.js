const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Oru thadava mattum dhaan irukkanum!
const Booking = require('../models/Booking');
const Leave = require('../models/Leave'); // Leave model sethirundhaa
const nodemailer = require('nodemailer');

// Transporter Setup (Use your Gmail SMTP or SendGrid credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// 1. Get Dynamic Realtime Counts for Customers and Partners
router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalPartners = await User.countDocuments({ role: 'partner' });
    const pendingPartners = await User.countDocuments({ role: 'partner', isVerified: false });
    const approvedPartners = await User.countDocuments({ role: 'partner', isVerified: true });
    
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalPartners,
        pendingPartners,
        approvedPartners,
        pendingBookings,
        completedBookings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Get All Customers
router.get('/customers', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Get All Partners (Pending & Verified)
router.get('/partners', async (req, res) => {
  try {
    const partners = await User.find({ role: 'partner' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, partners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Officer Verification & Approval Action API
router.put('/partner/approve/:id', async (req, res) => {
  try {
    const partnerIdParam = req.params.id;
    let partner = null;

    if (partnerIdParam.length === 24) {
      partner = await User.findById(partnerIdParam);
    } else {
      partner = await User.findOne({ 
        $or: [{ partnerId: partnerIdParam }, { mobile: partnerIdParam }, { email: partnerIdParam }] 
      });
    }

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found in database' });
    }

    const generatedUserId = partner.partnerId || 'PRT-' + Math.floor(100000 + Math.random() * 900000);
    const tempPassword = partner.password || ('epc@' + Math.floor(1000 + Math.random() * 9000));

    partner.isVerified = true;
    partner.status = 'Approved';
    partner.partnerId = generatedUserId;
    partner.password = tempPassword; // Save temp password in DB to view later
    await partner.save();

    // Send Credentials via Email
    const mailOptions = {
      from: '"EPC Services Admin" <noreply@epcservices.com>',
      to: partner.email,
      subject: '🎉 Partner Application Approved - EPC Services',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0d6efd;">Congratulations ${partner.name}!</h2>
          <p>Your partner application has been verified and approved by Admin.</p>
          <div style="background: #f8f9fa; border-left: 4px solid #198754; padding: 15px; margin: 15px 0;">
            <p style="margin: 0;"><strong>Partner User ID:</strong> ${generatedUserId}</p>
            <p style="margin: 5px 0 0 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          <p>You can now log in to the EPC Partner Portal.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions).catch(e => console.log('Mail send log:', e.message));

    res.json({ 
      success: true, 
      message: 'Partner verified & approved successfully!', 
      partnerId: generatedUserId,
      tempPassword
    });

    // 1 & 3. Get Operational Status (Active vs Offline) & Category Breakdown
router.get('/partner-analytics', async (req, res) => {
  try {
    const totalPartners = await User.countDocuments({ role: 'partner' });
    const activePartners = await User.countDocuments({ role: 'partner', isOnline: true });
    const inactivePartners = totalPartners - activePartners;

    const categoryCounts = await User.aggregate([
      { $match: { role: 'partner' } },
      { $group: { _id: "$designation", count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: { totalPartners, activePartners, inactivePartners, categoryCounts }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Partner Live GPS Locations for Admin View
router.get('/partner-locations', async (req, res) => {
  try {
    const locations = await User.find(
      { role: 'partner' },
      'name designation mobile liveLat liveLng isOnline lastLoginTime'
    );
    res.json({ success: true, locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Daily Attendance Register Logs
router.get('/attendance-logs', async (req, res) => {
  try {
    const attendance = await User.find(
      { role: 'partner' },
      'partnerId name designation isOnline lastLoginTime'
    );
    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Leave & Permission Requests View
router.get('/leave-requests', async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json({ success: true, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Approve or Reject Leave Request
router.put('/leave/action/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, message: `Leave request ${status} successfully`, leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;