"use client"

import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/auth/verify-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          // Token is invalid or expired
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Token verification error:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}
