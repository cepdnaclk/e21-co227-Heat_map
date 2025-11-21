const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendOrganizerApprovedEmail(organizer) {
  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: organizer.email,
    subject: 'Your Organizer Request Has Been Approved',
    html: `<p>Dear ${organizer.organizer_name},<br>Your registration has been approved. You can now log in and use the platform.</p>`
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendOrganizerApprovedEmail };
