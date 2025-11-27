// Email notification service using Resend (Free tier: 3,000 emails/month)
// Sign up at https://resend.com (no credit card needed for free tier)

export async function sendEmailNotification(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return false;
    }

    const result = await response.json();
    console.log('Email sent:', result.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Alternative: Using built-in nodemailer (works with Gmail, etc.)
import nodemailer from 'nodemailer';

export async function sendEmailWithNodemailer(to: string, subject: string, html: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      to: to,
      subject: subject,
      html: html,
    });

    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
