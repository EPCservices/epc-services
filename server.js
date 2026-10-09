require('dotenv').config(); // MUST BE ON TOP
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db.js');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Customer or Partner joins specific order room
  socket.on('join-order-room', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined room: order_${orderId}`);
  });

  // Partner sends live GPS coordinates
  socket.on('update-partner-location', (data) => {
    const { orderId, lat, lng } = data;
    
    // Broadcast location to all listeners in this order room (Customer app)
    io.to(`order_${orderId}`).emit('live-location-update', {
      lat,
      lng,
      updatedAt: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Database Connection
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Clean HTML Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/partner', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'partner.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Nodemailer & Transporter Setup
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'epcservice26@gmail.com',
    pass: 'kngk glfk sxjf bjhp' // Generated 16-digit app password
  }
});

app.post('/api/customer/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(1000 + Math.random() * 9000); // 4-Digit OTP

  const mailOptions = {
    from: '"EPC Services" <epcservice26@gmail.com>',
    to: email,
    subject: '🔑 EPC Services - Customer Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #0d6efd;">EPC Services Login</h2>
        <p>Your One-Time Password (OTP) for login is:</p>
        <h1 style="background: #f8f9fa; padding: 10px; text-align: center; letter-spacing: 5px; color: #333;">${otp}</h1>
        <p style="font-size: 12px; color: #666;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent to email successfully!', otp: otp });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/partner/send-credentials', async (req, res) => {
  const { partnerEmail, partnerName, partnerId, tempPassword } = req.body;

  const mailOptions = {
    from: '"EPC Admin Team" <epcservice26@gmail.com>',
    to: partnerEmail,
    subject: '🎉 Welcome to EPC Services - Your Partner Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #198754; border-radius: 8px;">
        <h2 style="color: #198754;">Congratulations ${partnerName}!</h2>
        <p>Your partner registration has been approved by the EPC Admin team.</p>
        <div style="background:#f4f6f9; padding:15px; border-radius:8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Partner User ID:</strong> <span style="color:#0d6efd; font-size: 16px;">${partnerId}</span></p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <span style="color:#333; font-size: 16px;"><b>${tempPassword}</b></span></p>
        </div>
        <p>You can now login to your partner portal using these credentials.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Partner Credentials sent via email successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fallback Catch-all Route for Express v5
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(cors({
  origin: '*', // Production-la unga dynamic frontend URL set pannalaam
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});