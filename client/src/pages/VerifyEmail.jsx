"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react"
import "../styles/verify-email.css"

export default function VerifyEmail() {
  const [isVerifying, setIsVerifying] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get("token")

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setIsVerifying(false)
        setError("Verification token is missing")
        return
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Failed to verify email")
        }

        setIsVerified(true)
        // Redirect to login with success message after 3 seconds
        setTimeout(() => {
          navigate("/login?verified=true")
        }, 3000)
      } catch (error) {
        setError(error.message)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [token, navigate])

  return (
    <div className="auth-container verify-email-container">
      <div className="verify-email-animated-bg"></div>

      <div className="w-full max-w-md">
        <div className="page-header fade-in">
          <h1 className="page-title">Email Verification</h1>
          <p className="page-subtitle">Verifying your email address</p>
        </div>

        <div className="auth-card verify-email-card bounce-in">
          {isVerifying ? (
            <div className="verify-email-loading">
              <div className="verify-email-spinner"></div>
              <h2 className="verify-email-loading-text">Verifying your email...</h2>
            </div>
          ) : isVerified ? (
            <div className="verify-email-success">
              <div className="verify-email-icon-container success">
                <CheckCircle className="verify-email-icon" />
              </div>
              <h2 className="verify-email-title">Email Verified!</h2>
              <p className="verify-email-message">
                Your email has been successfully verified. You will be redirected to the login page in a few seconds.
              </p>
              <Link to="/login" className="btn btn-primary verify-email-button">
                Go to Login
              </Link>
            </div>
          ) : (
            <div className="verify-email-error">
              <div className="verify-email-icon-container error">
                {error.includes("expired") ? (
                  <AlertCircle className="verify-email-icon" />
                ) : (
                  <XCircle className="verify-email-icon" />
                )}
              </div>
              <h2 className="verify-email-title">Verification Failed</h2>
              <p className="verify-email-message">{error}</p>
              <div className="verify-email-actions">
                <Link to="/login" className="btn btn-secondary verify-email-button">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Login
                </Link>
                <Link to="/signup" className="btn btn-primary verify-email-button">
                  Sign Up Again
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
