const mongoose = require('mongoose');
const dns = require('dns');

// Force DNS resolution to IPv4 first (Fixes querySrv ECONNREFUSED on Windows)
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI || "mongodb+srv://gudluckenterprises:Raja%402805@cluster0.apdueli.mongodb.net/epc_services?retryWrites=true&w=majority";
    
    await mongoose.connect(dbURI);
    console.log('MongoDB Connected Successfully!');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;