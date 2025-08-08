"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import {
  loadGoogleScript,
  initializeGoogleClient,
  renderGoogleButton,
  processGoogleCredential,
} from "../utils/googleAuth"
import "../styles/login.css"
import { API_ENDPOINTS, makeRequest } from "../server.js"

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check for verification success message in URL
    const params = new URLSearchParams(location.search)
    const verified = params.get("verified")
    if (verified === "true") {
      toast.success("Email verified successfully! You can now log in.")
    }

    // Load Google Sign-In
    const initGoogle = async () => {
      try {
        await loadGoogleScript()

        // Use the provided Google Client ID
        const googleClientId = "554561942399-899htd59kps6jcs57trmk74cium0hs5c.apps.googleusercontent.com"

        initializeGoogleClient(googleClientId, handleGoogleResponse)
        renderGoogleButton("google-signin-button")
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error)
      }
    }

    initGoogle()
  }, [location])

  const handleGoogleResponse = async (response) => {
    try {
      setIsLoading(true)
      const data = await processGoogleCredential(response)

      // Store token in localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      toast.success("Login successful!")
      navigate("/dashboard")
    } catch (error) {
      toast.error(error.message || "Google login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      // Add shake animation to form
      document.querySelector("form").classList.add("shake")
      setTimeout(() => {
        document.querySelector("form").classList.remove("shake")
      }, 500)
      return
    }

    setIsLoading(true)

    try {
      console.log("Attempting login with:", { email: formData.email, password: "***" })
      console.log("Login endpoint:", API_ENDPOINTS.LOGIN)

      // Test the API connection first
      try {
        const testResponse = await fetch(API_ENDPOINTS.TEST)
        const testText = await testResponse.text()
        console.log("Test API response:", testText)
      } catch (testError) {
        console.error("Test API failed:", testError)
      }

      // Make the login request
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      // Log the raw response for debugging
      const responseText = await response.text()
      console.log("Raw login response:", responseText)

      // Parse the response
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`)
      }

      // Check if response is ok
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`)
      }

      console.log("Login successful, received data:", data)

      // Store token in localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      toast.success("Login successful!")
      navigate("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error.message || "Login failed")
      setErrors({ general: error.message || "Login failed" })

      // Check if the user needs to verify their email
      if (error.message && error.message.includes("verify your email")) {
        setNeedsVerification(true)
        setVerificationEmail(formData.email)
      }

      // Add shake animation to form
      document.querySelector("form").classList.add("shake")
      setTimeout(() => {
        document.querySelector("form").classList.remove("shake")
      }, 500)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!verificationEmail) return

    setIsResendingVerification(true)
    try {
      await makeRequest(API_ENDPOINTS.RESEND_VERIFICATION, {
        method: "POST",
        body: JSON.stringify({ email: verificationEmail }),
      })

      toast.success("Verification email has been resent. Please check your inbox.")
    } catch (error) {
      toast.error(error.message || "Failed to resend verification email")
    } finally {
      setIsResendingVerification(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="auth-container login-container">
      <div className="login-animated-bg"></div>

      <div className="w-full max-w-md">
        <div className="page-header fade-in">
          <h1 className="page-title">Welcome Back</h1>
          <p className="page-subtitle">Sign in to your account to continue</p>
        </div>

        <div className="auth-card login-card bounce-in">
          <div className="auth-header">
            <h2 className="auth-title">Sign In</h2>
            <p className="auth-description">Enter your credentials to access your account</p>
          </div>

          <div className="auth-content">
            {needsVerification ? (
              <div className="verification-needed-container">
                <div className="verification-icon-container">
                  <AlertCircle size={48} className="verification-icon" />
                </div>
                <h3 className="verification-title">Email Verification Required</h3>
                <p className="verification-message">
                  Please verify your email address before logging in. We've sent a verification link to{" "}
                  <span className="verification-email">{verificationEmail}</span>.
                </p>
                <button
                  className="btn btn-primary verification-button"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                >
                  {isResendingVerification ? (
                    <>
                      <div className="login-loading"></div>
                      <span>Resending...</span>
                    </>
                  ) : (
                    <span>Resend Verification Email</span>
                  )}
                </button>
                <button
                  className="btn btn-secondary mt-4"
                  onClick={() => {
                    setNeedsVerification(false)
                    setVerificationEmail("")
                  }}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="alert alert-error slide-in-right">
                    <svg
                      className="alert-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span className="alert-message">{errors.general}</span>
                  </div>
                )}

                <div className="input-group form-field">
                  <label htmlFor="email" className="input-label">
                    <Mail className="input-label-icon" />
                    <span>Email</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input ${errors.email ? "error" : ""}`}
                    />
                    <Mail className="input-icon" />
                  </div>
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>

                <div className="input-group form-field">
                  <div className="login-options">
                    <label htmlFor="password" className="input-label">
                      <Lock className="input-label-icon" />
                      <span>Password</span>
                    </label>
                    <Link to="/forgot-password" className="link forgot-password">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="input-wrapper">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className={`form-input ${errors.password ? "error" : ""}`}
                    />
                    <Lock className="input-icon" />
                    <button type="button" onClick={togglePasswordVisibility} className="input-action password-toggle">
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {errors.password && <p className="error-text">{errors.password}</p>}
                </div>

                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>

                <button type="submit" className="btn btn-primary login-button" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="login-loading"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <LogIn className="btn-icon login-button-icon" />
                    </>
                  )}
                </button>

                <div className="divider">
                  <span className="divider-text">Or continue with</span>
                </div>

                <div id="google-signin-button" className="google-signin-container"></div>
              </form>
            )}
          </div>

          <div className="auth-footer">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
