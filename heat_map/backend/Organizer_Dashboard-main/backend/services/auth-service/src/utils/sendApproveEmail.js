// utils/sendApproveEmail.js
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

async function sendApprovalEmail(adminEmail, organizer, approvalLink) {
    const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: adminEmail,
        subject: 'Organizer Approval Request',
        html: `<p>New organizer registration request:</p>
               <ul>
                 <li>Name: ${organizer.organizer_name}</li>
                 <li>Email: ${organizer.email}</li>
               </ul>
               <p><a href="${approvalLink}">Approve this organizer</a></p>`
    };
    await transporter.sendMail(mailOptions);
}

module.exports = { sendApprovalEmail };
