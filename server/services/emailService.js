const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: `"AI Code Reviewer" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for AI Code Reviewer',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4F46E5;">AI Code Reviewer</h2>
        <p>Your OTP for account verification is:</p>
        <h1 style="letter-spacing: 8px; color: #4F46E5;">${otp}</h1>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
      </div>
    `
  });
};