package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	gomail "gopkg.in/mail.v2"
)

const SMTP_PORT = 587

func SendVerificationEmail(error_cannel chan<- error, app_name, from, to, frontend_url, token, full_name, smtp_host, smtp_user, smtp_pass string, smtp_port int) {
	verification_url := frontend_url + "/verify-email?token=" + token

	// Create a new message
	message := gomail.NewMessage()

	// Set email headers
	message.SetHeader("From", "\""+app_name+"\" <"+from+">")
	message.SetHeader("To", to)
	message.SetHeader("Subject", "Verify Your Email - "+app_name)

	// Set email body with inline styles for better email client compatibility
	body := `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to TalentsPal! 🎉</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ` + full_name + `,</h2>
            <p style="color: #555; font-size: 16px;">Thank you for signing up with TalentsPal! We're excited to have you on board.</p>
            <p style="color: #555; font-size: 16px;">To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="` + verification_url + `" style="display: inline-block; padding: 15px 40px; background: #7c3aed; color: #ffffff !important; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px;">Verify Email Address</a>
            </div>
            
            <p style="color: #555; font-size: 16px;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; color: #333; font-size: 14px; border: 1px solid #ddd;">` + verification_url + `</p>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <strong style="color: #856404;">⚠️ Important:</strong> <span style="color: #856404;">This verification link will expire in 24 hours.</span>
            </div>
            
            <p style="color: #555; font-size: 16px;">If you didn't create an account with TalentsPal, please ignore this email.</p>
            
            <p style="color: #555; font-size: 16px;">Best regards,<br>The TalentsPal Team</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p style="margin: 5px 0;">© ` + fmt.Sprintf("%d", time.Now().Year()) + ` TalentsPal. All rights reserved.</p>
            <p style="margin: 5px 0;">This is an automated email. Please do not reply to this message.</p>
          </div>
        </body>
      </html>
    `

	message.SetBody("text/html", body)

	// Set up the SMTP dialer
	dialer := gomail.NewDialer(smtp_host, smtp_port, smtp_user, smtp_pass)

	// Send the email
	if err := dialer.DialAndSend(message); err != nil {
		error_cannel <- fmt.Errorf("Error while sending verification email: %w", err)
	}
}

func GenerateVerificationToken() (string, error) {
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(tokenBytes), nil
}
