"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Eye, EyeOff, Lock, RefreshCw, ArrowLeft, AlertCircle, Check, X } from "lucide-react"
import "../styles/reset-password.css"

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(true)
  const [isTokenChecking, setIsTokenChecking] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get("token")

  // Password requirements
  const requirements = [
    { id: "length", label: "At least 6 characters", met: false },
    { id: "match", label: "Passwords match", met: false },
  ]

  const [passwordReqs, setPasswordReqs] = useState(requirements)

  useEffect(() => {
    // Check password requirements
    const updatedReqs = [...passwordReqs]

    // Length check
    updatedReqs[0].met = formData.password.length >= 6

    // Match check
    updatedReqs[1].met = formData.password === formData.confirmPassword && formData.password !== ""

    setPasswordReqs(updatedReqs)
  }, [formData.password, formData.confirmPassword])

  useEffect(() => {
    // Verify token validity
    const verifyToken = async () => {
      if (!token) {
        setIsTokenValid(false)
        setIsTokenChecking(false)
        return
      }

      try {
        const response = await fetch(`http://localhost:5000/api/auth/verify-reset-token?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Invalid or expired token")
        }

        setIsTokenValid(true)
      } catch (error) {
        setIsTokenValid(false)
        setErrors({ general: error.message })
      } finally {
        setIsTokenChecking(false)
      }
    }

    verifyToken()
  }, [token])

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

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
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
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password")
      }

      toast.success("Password reset successfully!")
      navigate("/login")
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  if (isTokenChecking) {
    return (
      <div className="auth-container reset-password-container">
        <div className="reset-password-animated-bg"></div>
        <div className="token-checking-container">
          <div className="token-checking-spinner"></div>
          <h2 className="token-checking-text">Verifying your reset link...</h2>
        </div>
      </div>
    )
  }

  if (!isTokenValid) {
    return (
      <div className="auth-container reset-password-container">
        <div className="reset-password-animated-bg"></div>

        <div className="w-full max-w-md">
          <div className="auth-card reset-password-card bounce-in">
            <div className="auth-header reset-password-header">
              <h2 className="auth-title">Invalid Reset Link</h2>
              <p className="auth-description">The password reset link is invalid or has expired</p>
            </div>
            <div className="auth-content">
              <div className="invalid-token-container">
                <div className="invalid-token-icon-container">
                  <AlertCircle className="invalid-token-icon" />
                </div>
                <h3 className="invalid-token-title">Link Expired</h3>
                <p className="invalid-token-message">
                  The password reset link you clicked is invalid or has expired. Please request a new one.
                </p>
                <Link to="/forgot-password" className="btn btn-primary">
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Request New Link
                </Link>
              </div>
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

  return (
    <div className="auth-container reset-password-container">
      <div className="reset-password-animated-bg"></div>

      <div className="w-full max-w-md">
        <div className="page-header fade-in">
          <h1 className="page-title">Reset Password</h1>
          <p className="page-subtitle">Create a new password for your account</p>
        </div>

        <div className="auth-card reset-password-card bounce-in">
          <div className="auth-header reset-password-header">
            <h2 className="auth-title">Create New Password</h2>
            <p className="auth-description">Your password must be at least 6 characters</p>
          </div>

          <div className="auth-content">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                <label htmlFor="password" className="input-label">
                  <Lock className="input-label-icon" />
                  <span>New Password</span>
                </label>
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

              <div className="input-group form-field">
                <label htmlFor="confirmPassword" className="input-label">
                  <Lock className="input-label-icon" />
                  <span>Confirm New Password</span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                  />
                  <Lock className="input-icon" />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="input-action password-toggle"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
              </div>

              <div className="password-requirements">
                <h4 className="requirements-title">Password Requirements:</h4>
                <ul className="requirements-list">
                  {passwordReqs.map((req) => (
                    <li key={req.id} className="requirement-item">
                      {req.met ? (
                        <Check className="requirement-icon valid" />
                      ) : (
                        <X className="requirement-icon invalid" />
                      )}
                      {req.label}
                    </li>
                  ))}
                </ul>
              </div>

              <button type="submit" className="btn btn-primary reset-password-button" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="reset-password-loading"></div>
                    <span>Resetting password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <RefreshCw className="btn-icon btn-icon-rotate" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="auth-footer">
            <p className="text-sm text-gray-600">
              <Link to="/login" className="link flex items-center justify-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
