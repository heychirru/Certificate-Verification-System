const nodemailer = require('nodemailer');

// ─────────────────────────────────────────────────────────────────────────────
// Create transporter using Gmail SMTP
// Note: GMAIL_APP_PASSWORD must NOT have spaces (even though Google displays with spaces)
// ─────────────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER?.trim(),
    pass: process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s/g, ''), // Remove all spaces
  },
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('✗ Email transporter verification failed:', error.message);
  } else {
    console.log('✓ Email transporter ready:', success);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Generate branded HTML verification email
// @param   {string} email - Recipient email
// @param   {string} verificationToken - Token to embed in verification link
// @param   {string} userName - User's name for personalization
// @return  {string} HTML email template
// ─────────────────────────────────────────────────────────────────────────────
const generateVerificationEmailHTML = (email, verificationToken, userName) => {
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .message {
          color: #666;
          margin-bottom: 30px;
          font-size: 14px;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .verify-button {
          display: inline-block;
          background-color: #667eea;
          color: white;
          padding: 12px 40px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          font-size: 16px;
          transition: background-color 0.3s ease;
        }
        .verify-button:hover {
          background-color: #764ba2;
        }
        .alternative-link {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #999;
        }
        .alternative-link a {
          color: #667eea;
          text-decoration: none;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #eee;
          font-size: 12px;
          color: #999;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 12px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello ${userName},</div>
          <div class="message">
            Thank you for registering with our Certificate Verification System. To complete your registration and unlock full access, please verify your email address by clicking the button below.
          </div>
          <div class="button-container">
            <a href="${verificationLink}" class="verify-button">Verify Email</a>
          </div>
          <div class="warning">
            <strong>This link expires in 24 hours.</strong> If you did not create this account, you can safely ignore this email.
          </div>
          <div class="alternative-link">
            If the button doesn't work, paste this link in your browser:<br>
            <a href="${verificationLink}">${verificationLink}</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2026 Certificate Verification System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Send verification email using Nodemailer
// @param   {string} email - Recipient email
// @param   {string} verificationToken - Token for verification
// @param   {string} userName - User's name
// @return  {Promise<void>}
// ─────────────────────────────────────────────────────────────────────────────
const sendVerificationEmail = async (email, verificationToken, userName) => {
  try {
    const mailOptions = {
      from: `"Certificate Verification System" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: generateVerificationEmailHTML(email, verificationToken, userName),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Verification email sent to ${email}`);
  } catch (error) {
    console.error(`✗ Failed to send verification email to ${email}:`, error.message);
    throw new Error('Failed to send verification email. Please try again later.');
  }
};

module.exports = { sendVerificationEmail };
