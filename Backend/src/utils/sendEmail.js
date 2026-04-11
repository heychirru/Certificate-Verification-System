const { Resend } = require('resend');

// ─────────────────────────────────────────────────────────────────────────────
// Initialize Resend client (uses HTTPS — works on Render free tier)
// ─────────────────────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

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
// @desc    Send verification email using Resend HTTP API with retry logic
// @param   {string} email - Recipient email
// @param   {string} verificationToken - Token for verification
// @param   {string} userName - User's name
// @return  {Promise<void>}
// ─────────────────────────────────────────────────────────────────────────────
const sendVerificationEmail = async (email, verificationToken, userName, retries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Certificate Verification System <onboarding@resend.dev>',
        to: email,
        subject: 'Verify Your Email Address',
        html: generateVerificationEmailHTML(email, verificationToken, userName),
      });

      if (error) {
        throw new Error(error.message || 'Resend API error');
      }

      console.log(`✓ Verification email sent to ${email} (id: ${data?.id})`);
      return; // Success

    } catch (error) {
      lastError = error;
      console.error(
        `⚠️  Attempt ${attempt}/${retries} - Failed to send email to ${email}:`,
        error.message
      );

      // Don't retry on auth/config errors
      if (
        error.message.includes('API key') ||
        error.message.includes('Invalid') ||
        error.message.includes('Unauthorized')
      ) {
        console.error('❌ Resend API key error - not retrying');
        break;
      }

      if (attempt < retries) {
        const waitTime = attempt * 2000;
        console.log(`⏳ Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error(
    `❌ Failed to send verification email to ${email} after ${retries} attempts:`,
    lastError.message
  );
  throw new Error(
    'Failed to send verification email. Your account has been created. ' +
    'Please contact support if you need to resend the verification email.'
  );
};

module.exports = { sendVerificationEmail };
