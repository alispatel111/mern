"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Mail, ArrowLeft, Send, CheckCircle, KeyRound } from "lucide-react"
import "../styles/forgot-password.css"
import { API_ENDPOINTS, makeRequest } from "../server.js"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [resetToken, setResetToken] = useState("")
  const navigate = useNavigate()

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (errors.email) {
      setErrors({ ...errors, email: "" })
    }
  }

  const handleOtpChange = (e) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, "")
    setOtp(value)
    if (errors.otp) {
      setErrors({ ...errors, otp: "" })
    }
  }

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value)
    if (errors.newPassword) {
      setErrors({ ...errors, newPassword: "" })
    }
  }

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value)
    if (errors.confirmPassword) {
      setErrors({ ...errors, confirmPassword: "" })
    }
  }

  const validateEmailForm = () => {
    const newErrors = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateOtpForm = () => {
    const newErrors = {}

    if (!otp) {
      newErrors.otp = "OTP is required"
    } else if (otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = () => {
    const newErrors = {}

    if (!newPassword) {
      newErrors.newPassword = "Password is required"
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRequestOTP = async (e) => {
    e.preventDefault()

    if (!validateEmailForm()) {
      // Add shake animation to form
      document.querySelector("form").classList.add("shake")
      setTimeout(() => {
        document.querySelector("form").classList.remove("shake")
      }, 500)
      return
    }

    setIsLoading(true)

    try {
      await makeRequest(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: "POST",
        body: JSON.stringify({ email }),
      })

      toast.success("OTP sent to your email address")
      setStep(2)
    } catch (error) {
      toast.error(error.message)
      setErrors({ general: error.message })

      // Add shake animation to form
      document.querySelector("form").classList.add("shake")
      setTimeout(() => {
        document.querySelector("form").classList.remove("shake")
      }, 500)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()

    if (!validateOtpForm()) {
      // Add shake animation to form
      document.querySelector("form").classList.add("shake")
      setTimeout(() => {
        document.querySelector("form").classList.remove("shake")
      }, 500)
      return
    }

    setIsLoading(true)

    try {
      const data = await makeRequest(API_ENDPOINTS.VERIFY_OTP, {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      })

      toast.success("OTP verified successfully")
      setResetToken(data.resetToken)
      setStep(3)
    } catch (error) {
      toast.error(error.message)
      setErrors({ general: error.message })

      // Add shake animation to form
      document.querySelector("form").classList.add("shake")
      setTimeout(() => {
        document.querySelector("form").classList.remove("shake")
      }, 500)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!validatePasswordForm()) {
      // Add shake animation to form
      document.querySelector("form").classList.add("shake")
      setTimeout(() => {
        document.querySelector("form").classList.remove("shake")
      }, 500)
      return
    }

    setIsLoading(true)

    try {
      const data = await makeRequest(API_ENDPOINTS.RESET_PASSWORD, {
        method: "POST",
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      })

      // Auto-login: Store token and user data
      if (data.token && data.user) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        toast.success("Password reset successfully. Redirecting to dashboard...")

        // Short delay before redirect for better UX
        setTimeout(() => {
          navigate("/dashboard")
        }, 1000)
      } else {
        // Fallback to login if auto-login data is not provided
        toast.success("Password reset successfully")
        navigate("/login")
      }
    } catch (error) {
      toast.error(error.message)
      setErrors({ general: error.message })

      // Add shake animation to form
      document.querySelector("form").classList.add("shake")
      setTimeout(() => {
        document.querySelector("form").classList.remove("shake")
      }, 500)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container forgot-password-container">
      <div className="forgot-password-animated-bg"></div>

      <div className="w-full max-w-md">
        <div className="page-header fade-in">
          <h1 className="page-title">Forgot Password</h1>
          <p className="page-subtitle">We'll help you reset your password</p>
        </div>

        <div className="auth-card forgot-password-card bounce-in">
          <div className="auth-header forgot-password-header">
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-description">
              {step === 1
                ? "Enter your email to receive a verification code"
                : step === 2
                  ? "Enter the verification code sent to your email"
                  : "Create a new password for your account"}
            </p>
          </div>

          <div className="auth-content">
            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-5">
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
                    <span>Email Address</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={handleEmailChange}
                      className={`form-input ${errors.email ? "error" : ""}`}
                    />
                    <Mail className="input-icon" />
                  </div>
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>

                <button type="submit" className="btn btn-primary forgot-password-button" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="forgot-password-loading"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <Send className="btn-icon forgot-password-button-icon" />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
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

                <div className="otp-message">
                  <p>
                    We've sent a verification code to <strong>{email}</strong>
                  </p>
                </div>

                <div className="input-group form-field">
                  <label htmlFor="otp" className="input-label">
                    <KeyRound className="input-label-icon" />
                    <span>Verification Code</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={handleOtpChange}
                      maxLength={6}
                      className={`form-input ${errors.otp ? "error" : ""}`}
                    />
                    <KeyRound className="input-icon" />
                  </div>
                  {errors.otp && <p className="error-text">{errors.otp}</p>}
                </div>

                <button type="submit" className="btn btn-primary forgot-password-button" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="forgot-password-loading"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <CheckCircle className="btn-icon forgot-password-button-icon" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button type="button" className="link resend-link" onClick={() => setStep(1)} disabled={isLoading}>
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Email
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
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
                  <label htmlFor="newPassword" className="input-label">
                    <KeyRound className="input-label-icon" />
                    <span>New Password</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={handlePasswordChange}
                      className={`form-input ${errors.newPassword ? "error" : ""}`}
                    />
                    <KeyRound className="input-icon" />
                  </div>
                  {errors.newPassword && <p className="error-text">{errors.newPassword}</p>}
                </div>

                <div className="input-group form-field">
                  <label htmlFor="confirmPassword" className="input-label">
                    <KeyRound className="input-label-icon" />
                    <span>Confirm Password</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                    />
                    <KeyRound className="input-icon" />
                  </div>
                  {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                </div>

                <button type="submit" className="btn btn-primary forgot-password-button" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="forgot-password-loading"></div>
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <CheckCircle className="btn-icon forgot-password-button-icon" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="auth-footer">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link to="/login" className="link">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
