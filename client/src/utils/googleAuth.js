// Google Authentication Utility Functions

// Load the Google API client library
export const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
      // Check if the script is already loaded
      if (document.querySelector("script#google-platform")) {
        resolve()
        return
      }
  
      // Create script element
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.id = "google-platform"
      script.async = true
      script.defer = true
  
      script.onload = () => {
        resolve()
      }
  
      script.onerror = () => {
        reject(new Error("Failed to load Google Platform script"))
      }
  
      document.head.appendChild(script)
    })
  }
  
  // Initialize Google client
  export const initializeGoogleClient = (clientId, callback) => {
    if (!window.google) {
      console.error("Google API not loaded")
      return
    }
  
    try {
      // Use the provided Google Client ID
      const actualClientId = "554561942399-899htd59kps6jcs57trmk74cium0hs5c.apps.googleusercontent.com"
  
      window.google.accounts.id.initialize({
        client_id: actualClientId,
        callback: callback,
        auto_select: false,
        cancel_on_tap_outside: true,
      })
    } catch (error) {
      console.error("Error initializing Google client:", error)
    }
  }
  
  // Render Google sign-in button
  export const renderGoogleButton = (elementId) => {
    if (!window.google) {
      console.error("Google API not loaded")
      return
    }
  
    try {
      window.google.accounts.id.renderButton(document.getElementById(elementId), {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "center",
      })
    } catch (error) {
      console.error("Error rendering Google button:", error)
    }
  }
  
  // Process Google credential response
  export const processGoogleCredential = async (response) => {
    try {
      // Send the ID token to your server
      const result = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: response.credential }),
      })
  
      const data = await result.json()
  
      if (!result.ok) {
        throw new Error(data.message || "Failed to authenticate with Google")
      }
  
      return data
    } catch (error) {
      console.error("Error processing Google credential:", error)
      throw error
    }
  }
  