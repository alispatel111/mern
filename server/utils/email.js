import nodemailer from "nodemailer"
import { getPasswordResetOTPTemplate, getVerificationEmailTemplate, getWelcomeEmailTemplate } from "./emailTemplates.js"

// Create reusable transporter
const createTransporter = async () => {
  // Use Gmail with app password
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "alis.flyanytrip@gmail.com",
      pass: "shte hvnj qgvm nbsl",
    },
  })
}

// Send password reset OTP email
export const sendPasswordResetOTP = async (email, otp) => {
  try {
    console.log("Attempting to send password reset OTP to:", email)

    const transporter = await createTransporter()

    // Email options
    const mailOptions = {
      from: '"MERN Auth App" <alis.flyanytrip@gmail.com>',
      to: email,
      subject: "Password Reset OTP",
      html: getPasswordResetOTPTemplate(otp),
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("OTP email sent successfully")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error sending OTP email:", error)
    return { success: false, error: error.message }
  }
}

// Send verification email
export const sendVerificationEmail = async (email, verificationUrl) => {
  try {
    console.log("Attempting to send verification email to:", email)

    const transporter = await createTransporter()

    // Email options
    const mailOptions = {
      from: '"MERN Auth App" <alis.flyanytrip@gmail.com>',
      to: email,
      subject: "Verify Your Email Address",
      html: getVerificationEmailTemplate(verificationUrl),
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("Verification email sent successfully")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error sending verification email:", error)
    console.log("For development purposes, here's the verification URL:", verificationUrl)
    return { success: false, error: error.message, verificationUrl }
  }
}

// Send welcome email after verification
export const sendWelcomeEmail = async (email, name, loginUrl) => {
  try {
    console.log("Sending welcome email to:", email)

    const transporter = await createTransporter()

    // Email options
    const mailOptions = {
      from: '"MERN Auth App" <alis.flyanytrip@gmail.com>',
      to: email,
      subject: "Welcome to MERN Auth!",
      html: getWelcomeEmailTemplate(name, loginUrl),
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("Welcome email sent successfully")

    return { success: true }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return { success: false, error: error.message }
  }
}
