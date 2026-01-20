import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Constants
const TOKEN_BYTE_SIZE = 32;
const VERIFICATION_EXPIRY_HOURS = 24;
const DEFAULT_SMTP_PORT = 587;
const DEFAULT_APP_NAME = 'TalentsPal';

/**
 * Email Configuration
 * Using Gmail SMTP with app password
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || `${DEFAULT_SMTP_PORT}`),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'talentspalsup@gmail.com',
    pass: process.env.SMTP_PASS?.replace(/\s/g, '') || '',
  },

  // ✅ connection pooling
  pool: true,
  maxConnections: 2,
  maxMessages: 100,
});

/**
 * Generate a random verification token
 */
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(TOKEN_BYTE_SIZE).toString('hex');
};

/**
 * Send verification email to user
 */
export const sendVerificationEmail = async (
  email: string,
  fullName: string,
  verificationToken: string
): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"${process.env.APP_NAME || DEFAULT_APP_NAME}" <${process.env.EMAIL_FROM || process.env.SMTP_USER || 'talentspalsup@gmail.com'}>`,
    to: email,
    subject: `Verify Your Email - ${process.env.APP_NAME || DEFAULT_APP_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 15px 40px;
              background: #7c3aed;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 10px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to TalentsPal! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hi ${fullName},</h2>
            <p>Thank you for signing up with TalentsPal! We're excited to have you on board.</p>
            <p>To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button" style="color: #ffffff !important;">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This verification link will expire in ${VERIFICATION_EXPIRY_HOURS} hours.
            </div>
            
            <p>If you didn't create an account with TalentsPal, please ignore this email.</p>
            
            <p>Best regards,<br>The TalentsPal Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TalentsPal. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to TalentsPal!
      
      Hi ${fullName},
      
      Thank you for signing up with TalentsPal! We're excited to have you on board.
      
      To complete your registration and start using your account, please verify your email address by visiting this link:
      
      ${verificationUrl}
      
      This verification link will expire in ${VERIFICATION_EXPIRY_HOURS} hours.
      
      If you didn't create an account with TalentsPal, please ignore this email.
      
      Best regards,
      The TalentsPal Team
    `,
  };

  try {
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, rej) => setTimeout(() => rej(new Error("SMTP timeout")), 8000)),
    ]);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'TalentsPal'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER || 'talentspalsup@gmail.com'}>`,
    to: email,
    subject: `Password Reset Request - ${process.env.APP_NAME || 'TalentsPal'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 15px 40px;
              background: #7c3aed;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 10px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Password Reset Request 🔐</h1>
          </div>
          <div class="content">
            <h2>Hi ${fullName},</h2>
            <p>We received a request to reset your password for your TalentsPal account.</p>
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button" style="color: #ffffff !important;">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This password reset link will expire in 1 hour.
            </div>
            
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            
            <p>Best regards,<br>The TalentsPal Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TalentsPal. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request
      
      Hi ${fullName},
      
      We received a request to reset your password for your TalentsPal account.
      
      Click the link below to reset your password:
      
      ${resetUrl}
      
      This password reset link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      
      Best regards,
      The TalentsPal Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Test email configuration
 */
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
};
