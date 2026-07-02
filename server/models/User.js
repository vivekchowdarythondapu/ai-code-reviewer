const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  totalReviews: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActive: { type: Date, default: null }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);