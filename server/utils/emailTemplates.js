/**
 * Email templates for various email notifications
 */

// Password reset OTP email template
const getPasswordResetOTPTemplate = (otp) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #3b82f6;">Password Reset OTP</h1>
        </div>
        <div style="margin-bottom: 30px; line-height: 1.5; color: #333;">
          <p>You requested a password reset. Use the following OTP (One-Time Password) to verify your identity:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
              ${otp}
            </div>
          </div>
          <p>This OTP will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 12px; color: #666; text-align: center;">
          <p>© ${new Date().getFullYear()} MERN Auth. All rights reserved.</p>
        </div>
      </div>
    `
  }
  
  // Email verification template
  const getVerificationEmailTemplate = (verificationUrl) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #3b82f6;">Verify Your Email Address</h1>
        </div>
        <div style="margin-bottom: 30px; line-height: 1.5; color: #333;">
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
          </div>
          <p>If you didn't create an account, please ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 12px; color: #666; text-align: center;">
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
        </div>
      </div>
    `
  }
  
  // Welcome email after verification
  const getWelcomeEmailTemplate = (name, loginUrl) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #3b82f6;">Welcome to MERN Auth!</h1>
        </div>
        <div style="margin-bottom: 30px; line-height: 1.5; color: #333;">
          <p>Hi ${name},</p>
          <p>Thank you for verifying your email address. Your account is now active and you can start using our services.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Login to Your Account</a>
          </div>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        </div>
        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 12px; color: #666; text-align: center;">
          <p>© ${new Date().getFullYear()} MERN Auth. All rights reserved.</p>
        </div>
      </div>
    `
  }
  
  export { getPasswordResetOTPTemplate, getVerificationEmailTemplate, getWelcomeEmailTemplate }
  