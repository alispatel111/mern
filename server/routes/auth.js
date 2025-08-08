import express from "express"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import User from "../models/User.js"
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetOTP } from "../utils/email.js"
import { authenticateToken } from "../middleware/auth.js"
import { generateOTP } from "../utils/otp.js"

const router = express.Router()

// Debug middleware to log route access
router.use((req, res, next) => {
  console.log(`Auth route accessed: ${req.method} ${req.originalUrl}`)
  console.log("Request headers:", req.headers)
  if (req.method === "POST") {
    console.log("Request body:", req.body)
  }
  next()
})

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString("hex")
    const verificationTokenExpires = Date.now() + 86400000 // 24 hours

    // Create new user
    const user = new User({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    })

    await user.save()

    // Create verification URL
    const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`

    // Send verification email
    await sendVerificationEmail(email, verificationUrl)

    res.status(201).json({
      message: "User created successfully. Please check your email to verify your account.",
      verificationUrl: process.env.NODE_ENV === "production" ? undefined : verificationUrl,
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ message: "Error creating user" })
  }
})

// Email verification route
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query

    // Find user with this token and check if it's still valid
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
      isVerified: false,
    })

    if (!user) {
      return res.status(400).json({ message: "Verification token is invalid or has expired" })
    }

    // Update user as verified
    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined

    await user.save()

    // Send welcome email
    const loginUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/login`
    await sendWelcomeEmail(user.email, user.name, loginUrl)

    res.json({ message: "Email verified successfully. You can now log in." })
  } catch (error) {
    console.error("Email verification error:", error)
    res.status(500).json({ message: "Error verifying email" })
  }
})

// Resend verification email
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body

    // Find user by email
    const user = await User.findOne({ email, isVerified: false })
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist or is already verified
      return res.json({ message: "If your email exists and is not verified, a new verification link has been sent." })
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(20).toString("hex")
    const verificationTokenExpires = Date.now() + 86400000 // 24 hours

    // Update user with new token
    user.verificationToken = verificationToken
    user.verificationTokenExpires = verificationTokenExpires

    await user.save()

    // Create verification URL
    const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`

    // Send verification email
    await sendVerificationEmail(email, verificationUrl)

    res.json({
      message: "If your email exists and is not verified, a new verification link has been sent.",
      verificationUrl: process.env.NODE_ENV === "production" ? undefined : verificationUrl,
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    res.status(500).json({ message: "Error resending verification email" })
  }
})

// Login route
router.post("/login", async (req, res) => {
  try {
    console.log("Login attempt received:", req.body)

    const { email, password } = req.body

    if (!email || !password) {
      console.log("Missing email or password")
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      console.log("User not found:", email)
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Check if user is verified
    if (!user.isVerified) {
      console.log("User not verified:", email)
      return res.status(401).json({
        message: "Please verify your email before logging in",
        needsVerification: true,
        email: user.email,
      })
    }

    // Check password (only if user has a password - Google users might not)
    if (user.password) {
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        console.log("Password doesn't match for user:", email)
        return res.status(401).json({ message: "Invalid email or password" })
      }
    } else {
      // If user doesn't have a password (Google user), they can't log in with password
      console.log("Google user attempting password login:", email)
      return res.status(401).json({ message: "Please log in with Google" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1d" })

    // Return user info (excluding password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthday: user.birthday,
      location: user.location,
      bio: user.bio,
      occupation: user.occupation,
      website: user.website,
      joinDate: user.joinDate,
      profileImage: user.profileImage,
      socialLinks: user.socialLinks,
    }

    console.log("Login successful for user:", email)
    res.json({ token, user: userResponse })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Error during login" })
  }
})

// Add a test login route for debugging
router.get("/login-test", (req, res) => {
  res.json({ message: "Login endpoint is working!" })
})

// Google OAuth routes
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body // This is the ID token from Google

    // Verify the token with Google
    const ticket = await verifyGoogleToken(token)
    if (!ticket) {
      return res.status(400).json({ message: "Invalid Google token" })
    }

    const { name, email, picture } = ticket

    // Check if user exists
    let user = await User.findOne({ email })

    if (user) {
      // Update user if needed
      if (!user.googleId) {
        user.googleId = email // Using email as googleId for simplicity
      }
      if (picture && !user.profileImage) {
        user.profileImage = picture
      }
      user.isVerified = true // Google accounts are automatically verified
      await user.save()
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId: email, // Using email as googleId for simplicity
        profileImage: picture || "",
        isVerified: true, // Google accounts are automatically verified
      })
      await user.save()
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1d" })

    // Return user info
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthday: user.birthday,
      location: user.location,
      bio: user.bio,
      occupation: user.occupation,
      website: user.website,
      joinDate: user.joinDate,
      profileImage: user.profileImage || picture,
      socialLinks: user.socialLinks,
    }

    res.json({ token: jwtToken, user: userResponse })
  } catch (error) {
    console.error("Google auth error:", error)
    res.status(500).json({ message: "Error during Google authentication" })
  }
})

// Helper function to verify Google token
// In a real implementation, you would use the Google Auth Library
const verifyGoogleToken = async (token) => {
  try {
    // This is a simplified version. In production, use the Google Auth Library
    // to verify the token with Google's servers

    // For demo purposes, we'll decode the token and extract the payload
    // In production, NEVER trust the token without verification
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    const payload = JSON.parse(jsonPayload)

    return {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    }
  } catch (error) {
    console.error("Error verifying Google token:", error)
    return null
  }
}

// Forgot password route - Send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.json({ message: "If your email exists, an OTP has been sent to it" })
    }

    // Generate OTP
    const otp = generateOTP(6)
    console.log("Generated OTP:", otp)

    // Set OTP and expiration (15 minutes)
    user.resetOTP = otp
    user.resetOTPExpires = Date.now() + 900000 // 15 minutes

    await user.save()
    console.log("User saved with reset OTP")

    // Send OTP email
    const emailResult = await sendPasswordResetOTP(user.email, otp)

    if (!emailResult.success) {
      console.error("Error sending OTP email:", emailResult.error)
    }

    // Return success even if email fails (for development)
    return res.json({
      message: "If your email exists, an OTP has been sent to it",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Error processing password reset request" })
  }
})

// Verify OTP route
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" })
    }

    // Find user with this email and OTP and check if it's still valid
    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    // Generate a temporary token for password reset
    const resetToken = crypto.randomBytes(20).toString("hex")
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 900000 // 15 minutes

    // Clear the OTP
    user.resetOTP = undefined
    user.resetOTPExpires = undefined

    await user.save()

    res.json({
      message: "OTP verified successfully",
      resetToken,
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    res.status(500).json({ message: "Error verifying OTP" })
  }
})

// Reset password route with auto-login
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body

    // Find user with this token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" })
    }

    // Set new password
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    // Generate JWT token for auto-login
    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1d" })

    // Return user info (excluding password) for auto-login
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthday: user.birthday,
      location: user.location,
      bio: user.bio,
      occupation: user.occupation,
      website: user.website,
      joinDate: user.joinDate,
      profileImage: user.profileImage,
      socialLinks: user.socialLinks,
    }

    res.json({
      message: "Password has been reset successfully",
      token: authToken,
      user: userResponse,
      autoLogin: true,
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ message: "Error resetting password" })
  }
})

// Verify token route
router.get("/verify-token", authenticateToken, (req, res) => {
  res.json({ message: "Token is valid", userId: req.userId })
})

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Error fetching profile" })
  }
})

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, birthday, location, bio, occupation, website, profileImage, socialLinks } = req.body

    // Find user
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update fields
    if (name) user.name = name
    if (email) user.email = email
    if (phone !== undefined) user.phone = phone
    if (birthday !== undefined) user.birthday = birthday
    if (location) user.location = location
    if (bio) user.bio = bio
    if (occupation) user.occupation = occupation
    if (website) user.website = website
    if (profileImage) user.profileImage = profileImage

    // Update social links if provided
    if (socialLinks) {
      if (socialLinks.twitter) user.socialLinks.twitter = socialLinks.twitter
      if (socialLinks.linkedin) user.socialLinks.linkedin = socialLinks.linkedin
      if (socialLinks.github) user.socialLinks.github = socialLinks.github
    }

    await user.save()

    // Return updated user (excluding password)
    const updatedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthday: user.birthday,
      location: user.location,
      bio: user.bio,
      occupation: user.occupation,
      website: user.website,
      joinDate: user.joinDate,
      profileImage: user.profileImage,
      socialLinks: user.socialLinks,
    }

    res.json({ message: "Profile updated successfully", user: updatedUser })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Error updating profile" })
  }
})

// Test route to verify the router is working
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" })
})

export default router
