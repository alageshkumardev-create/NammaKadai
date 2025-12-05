const axios = require('axios');
const nodemailer = require('nodemailer');

// ============================================
// FREE SMS SERVICE - Fast2SMS (India)
// ============================================
// Sign up at https://www.fast2sms.com/ for free API key
// Free tier: 50 SMS/day

const sendSMSFast2SMS = async (phone, message) => {
  try {
    if (!process.env.FAST2SMS_API_KEY) {
      console.log('⚠️  Fast2SMS not configured');
      return { success: false, error: 'Fast2SMS API key not configured' };
    }

    // Remove +91 if present, Fast2SMS expects 10-digit number
    const cleanPhone = phone.replace(/^\+91/, '').replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      return { success: false, error: 'Invalid phone number format' };
    }

    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: 'v3',
      sender_id: 'TXTIND',
      message: message.substring(0, 500), // Limit to 500 chars
      language: 'english',
      flash: 0,
      numbers: cleanPhone
    }, {
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.data.return === true) {
      console.log(`✅ SMS sent to ${cleanPhone} via Fast2SMS`);
      return { success: true, provider: 'Fast2SMS', messageId: response.data.request_id };
    } else {
      console.log(`❌ Fast2SMS error: ${response.data.message}`);
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    console.error('❌ Fast2SMS error:', error.message);
    return { success: false, error: error.message };
  }
};

// ============================================
// FREE EMAIL SERVICE - Gmail via Nodemailer
// ============================================
// Use Gmail with App Password (free)
// Setup: Gmail → Security → 2-Step Verification → App Passwords

const sendEmailGmail = async (to, subject, message) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log('⚠️  Gmail not configured');
      return { success: false, error: 'Gmail credentials not configured' };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: `"RO Service" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">RO Service Reminder</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <pre style="white-space: pre-wrap; font-family: monospace;">${message}</pre>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
            This is an automated message from RO Maintenance System
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} via Gmail`);
    return { success: true, provider: 'Gmail', messageId: result.messageId };
  } catch (error) {
    console.error('❌ Gmail error:', error.message);
    return { success: false, error: error.message };
  }
};

// ============================================
// UNIFIED SEND FUNCTIONS
// ============================================

const sendSMS = async (phone, message) => {
  // Try Fast2SMS first
  return await sendSMSFast2SMS(phone, message);
};

const sendEmail = async (to, subject, message) => {
  // Try Gmail
  return await sendEmailGmail(to, subject, message);
};

// Send to multiple recipients
const sendToMultiple = async (recipients, subject, message) => {
  const results = [];

  for (const recipient of recipients) {
    const result = {
      name: recipient.name,
      phone: recipient.phone,
      email: recipient.email,
      sms: null,
      email: null
    };

    // Send SMS if phone number provided
    if (recipient.phone) {
      result.sms = await sendSMS(recipient.phone, message);
    }

    // Send email if email provided
    if (recipient.email) {
      result.emailResult = await sendEmail(recipient.email, subject, message);
    }

    results.push(result);
  }

  return results;
};

module.exports = {
  sendSMS,
  sendEmail,
  sendToMultiple
};
