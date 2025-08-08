// Simple test file to check if the server can run
import express from "express"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Create Express app
const app = express()

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Test server is working!",
    env: {
      NODE_ENV: process.env.NODE_ENV,
      // Don't log actual values of sensitive variables
      MONGODB_URI: process.env.MONGODB_URI ? "set" : "not set",
      JWT_SECRET: process.env.JWT_SECRET ? "set" : "not set",
    },
  })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`)
})
