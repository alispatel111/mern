"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, Mail, Lock, Eye, EyeOff, Check, ArrowRight, AlertCircle, Loader, CheckCircle } from "lucide-react"
import "../styles/signup-redesign.css"
import { API_ENDPOINTS, makeRequest } from "../server.js"

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [formState, setFormState] = useState({
    step: 1,
    errors: {},
    touched: {},
    showPassword: false,
    showConfirmPassword: false,
    isSubmitting: false,
    isSuccess: false,
  })

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "Too weak",
    color: "#ff4d4f",
  })

  const navigate = useNavigate()

  // Password requirements
  const passwordRequirements = [
    { id: "length", label: "At least 8 characters", valid: formData.password.length >= 8 },
    { id: "number", label: "At least one number", valid: /\d/.test(formData.password) },
    { id: "special", label: "At least one special character", valid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
    { id: "lowercase", label: "At least one lowercase letter", valid: /[a-z]/.test(formData.password) },
    { id: "uppercase", label: "At least one uppercase letter", valid: /[A-Z]/.test(formData.password) },
    {
      id: "match",
      label: "Passwords match",
      valid: formData.password === formData.confirmPassword && formData.password !== "",
    },
  ]

  // Calculate password strength whenever password changes
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength({ score: 0, label: "Too weak", color: "#ff4d4f" })
      return
    }

    const validRequirements = passwordRequirements.filter((req) => req.id !== "match" && req.valid).length
    const totalRequirements = passwordRequirements.length - 1 // Exclude match requirement

    const score = Math.floor((validRequirements / totalRequirements) * 100)
    let label = "Too weak"
    let color = "#ff4d4f"

    if (score >= 100) {
      label = "Strong"
      color = "#52c41a"
    } else if (score >= 80) {
      label = "Good"
      color = "#52c41a"
    } else if (score >= 50) {
      label = "Fair"
      color = "#faad14"
    } else if (score >= 30) {
      label = "Weak"
      color = "#ff7a45"
    }

    setPasswordStrength({ score, label, color })
  }, [formData.password])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (formState.errors[name]) {
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [name]: "",
        },
      }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setFormState((prev) => ({
      ...prev,
      touched: {
        ...prev.touched,
        [name]: true,
      },
    }))

    // Validate field on blur
    validateField(name)
  }

  const validateField = (fieldName) => {
    let error = ""

    switch (fieldName) {
      case "name":
        if (!formData.name.trim()) {
          error = "Name is required"
        }
        break
      case "email":
        if (!formData.email.trim()) {
          error = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          error = "Email is invalid"
        }
        break
      case "password":
        if (!formData.password) {
          error = "Password is required"
        } else if (formData.password.length < 8) {
          error = "Password must be at least 8 characters"
        }
        break
      case "confirmPassword":
        if (formData.password !== formData.confirmPassword) {
          error = "Passwords don't match"
        }
        break
      default:
        break
    }

    setFormState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldName]: error,
      },
    }))

    return !error
  }

  const validateForm = () => {
    const nameValid = validateField("name")
    const emailValid = validateField("email")
    const passwordValid = validateField("password")
    const confirmPasswordValid = validateField("confirmPassword")

    return nameValid && emailValid && passwordValid && confirmPasswordValid
  }

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setFormState((prev) => ({
        ...prev,
        showPassword: !prev.showPassword,
      }))
    } else {
      setFormState((prev) => ({
        ...prev,
        showConfirmPassword: !prev.showConfirmPassword,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      // Add shake animation to form
      const form = document.querySelector(".signup-redesign-form")
      form.classList.add("signup-redesign-shake")
      setTimeout(() => {
        form.classList.remove("signup-redesign-shake")
      }, 600)
      return
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }))

    try {
      await makeRequest(API_ENDPOINTS.REGISTER, {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      // Show success state
      setFormState((prev) => ({ ...prev, isSuccess: true }))

      // Redirect after showing success animation
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          general: error.message,
        },
        isSubmitting: false,
      }))

      // Add shake animation to form on error
      const form = document.querySelector(".signup-redesign-form")
      form.classList.add("signup-redesign-shake")
      setTimeout(() => {
        form.classList.remove("signup-redesign-shake")
      }, 600)
    }
  }

  return (
    <div className="signup-redesign-container">
      <div className="signup-redesign-background">
        <div className="signup-redesign-shape signup-redesign-shape-1"></div>
        <div className="signup-redesign-shape signup-redesign-shape-2"></div>
        <div className="signup-redesign-shape signup-redesign-shape-3"></div>
      </div>

      <div className="signup-redesign-card">
        <div className="signup-redesign-header">
          <div className="signup-redesign-logo">
            <div className="signup-redesign-logo-icon">M</div>
            <h1 className="signup-redesign-logo-text">MERN Auth</h1>
          </div>
          <h2 className="signup-redesign-title">Create your account</h2>
          <p className="signup-redesign-subtitle">Fill in your details to get started</p>
        </div>

        {formState.isSuccess ? (
          <div className="signup-redesign-success">
            <div className="signup-redesign-success-icon">
              <CheckCircle size={48} />
            </div>
            <h3 className="signup-redesign-success-title">Account Created!</h3>
            <p className="signup-redesign-success-message">
              Your account has been successfully created. Redirecting you to login...
            </p>
          </div>
        ) : (
          <form className="signup-redesign-form" onSubmit={handleSubmit}>
            {formState.errors.general && (
              <div className="signup-redesign-error-message">
                <AlertCircle size={18} />
                <span>{formState.errors.general}</span>
              </div>
            )}

            <div className="signup-redesign-form-columns">
              <div className="signup-redesign-form-column">
                <div className="signup-redesign-field">
                  <label className="signup-redesign-label" htmlFor="name">
                    Full Name
                  </label>
                  <div
                    className={`signup-redesign-input-wrapper ${formState.errors.name && formState.touched.name ? "signup-redesign-input-error" : ""}`}
                  >
                    <User className="signup-redesign-input-icon" size={18} />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="signup-redesign-input"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {!formState.errors.name && formData.name && (
                      <Check className="signup-redesign-input-check" size={18} />
                    )}
                  </div>
                  {formState.errors.name && formState.touched.name && (
                    <div className="signup-redesign-error">
                      <AlertCircle size={14} />
                      <span>{formState.errors.name}</span>
                    </div>
                  )}
                </div>

                <div className="signup-redesign-field">
                  <label className="signup-redesign-label" htmlFor="email">
                    Email Address
                  </label>
                  <div
                    className={`signup-redesign-input-wrapper ${formState.errors.email && formState.touched.email ? "signup-redesign-input-error" : ""}`}
                  >
                    <Mail className="signup-redesign-input-icon" size={18} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="signup-redesign-input"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {!formState.errors.email && formData.email && (
                      <Check className="signup-redesign-input-check" size={18} />
                    )}
                  </div>
                  {formState.errors.email && formState.touched.email && (
                    <div className="signup-redesign-error">
                      <AlertCircle size={14} />
                      <span>{formState.errors.email}</span>
                    </div>
                  )}
                </div>

                <div className="signup-redesign-requirements">
                  <h4 className="signup-redesign-requirements-title">Password must have:</h4>
                  <div className="signup-redesign-requirements-grid">
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.id}
                        className={`signup-redesign-requirement ${req.valid ? "signup-redesign-requirement-valid" : ""}`}
                      >
                        <div className="signup-redesign-requirement-icon">{req.valid ? <Check size={12} /> : null}</div>
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="signup-redesign-form-column">
                <div className="signup-redesign-field">
                  <label className="signup-redesign-label" htmlFor="password">
                    Password
                  </label>
                  <div
                    className={`signup-redesign-input-wrapper ${formState.errors.password && formState.touched.password ? "signup-redesign-input-error" : ""}`}
                  >
                    <Lock className="signup-redesign-input-icon" size={18} />
                    <input
                      type={formState.showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className="signup-redesign-input"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <button
                      type="button"
                      className="signup-redesign-password-toggle"
                      onClick={() => togglePasswordVisibility("password")}
                      tabIndex="-1"
                    >
                      {formState.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formState.errors.password && formState.touched.password && (
                    <div className="signup-redesign-error">
                      <AlertCircle size={14} />
                      <span>{formState.errors.password}</span>
                    </div>
                  )}

                  {formData.password && (
                    <div className="signup-redesign-password-strength">
                      <div className="signup-redesign-strength-bar-container">
                        <div
                          className="signup-redesign-strength-bar"
                          style={{
                            width: `${passwordStrength.score}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        ></div>
                      </div>
                      <span className="signup-redesign-strength-text" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="signup-redesign-field">
                  <label className="signup-redesign-label" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div
                    className={`signup-redesign-input-wrapper ${formState.errors.confirmPassword && formState.touched.confirmPassword ? "signup-redesign-input-error" : ""}`}
                  >
                    <Lock className="signup-redesign-input-icon" size={18} />
                    <input
                      type={formState.showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="signup-redesign-input"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <button
                      type="button"
                      className="signup-redesign-password-toggle"
                      onClick={() => togglePasswordVisibility("confirmPassword")}
                      tabIndex="-1"
                    >
                      {formState.showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formState.errors.confirmPassword && formState.touched.confirmPassword && (
                    <div className="signup-redesign-error">
                      <AlertCircle size={14} />
                      <span>{formState.errors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={`signup-redesign-button ${formState.isSubmitting ? "signup-redesign-button-loading" : ""}`}
                  disabled={formState.isSubmitting}
                >
                  {formState.isSubmitting ? (
                    <>
                      <Loader className="signup-redesign-spinner" size={20} />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="signup-redesign-login-link">
                  Already have an account? <Link to="/login">Sign in</Link>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Signup
