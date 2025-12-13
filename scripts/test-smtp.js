const nodemailer = require('nodemailer');
const fs = require('fs');

async function run() {
  console.log('Starting SMTP test...');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('Transporter verified');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'SMTP test from opticien-marketplace',
      text: 'This is a test message from local nodemailer script.',
    });

    console.log('Message sent successfully:');
    console.log(info);
  } catch (err) {
    console.error('SMTP error:');
    console.error(err);
  }
}

run();
