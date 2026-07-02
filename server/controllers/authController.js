const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../services/emailService');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Step 1 - Register: Save user + send OTP
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email, isVerified: true });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await User.findOneAndUpdate(
      { email },
      { name, email, password: hash, otp, otpExpiry, isVerified: false },
      { upsert: true, new: true }
    );

    await sendOTP(email, otp);

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Step 2 - Verify OTP: Confirm + create account
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP expired' });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isVerified: true });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};