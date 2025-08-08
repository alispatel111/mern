import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

// Load environment variables
dotenv.config()

// Log environment variables (excluding sensitive ones)
console.log("Environment variables loaded:", {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CLIENT_URL: process.env.CLIENT_URL,
  MONGODB_URI: process.env.MONGODB_URI ? "Set" : "Not set",
  JWT_SECRET: process.env.JWT_SECRET ? "Set" : "Not set",
  EMAIL_USER: process.env.EMAIL_USER ? "Set" : "Not set",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "Set" : "Not set",
})

// Fix Mongoose deprecation warning
mongoose.set("strictQuery", false)

// Create Express app
const app = express()

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
)

// Increase the body parser limit to handle larger payloads (like base64 images)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`)
  console.log("Request headers:", req.headers)

  // Log request body for POST requests (but truncate if too large)
  if (req.method === "POST" || req.method === "PUT") {
    const bodyClone = { ...req.body }
    // Don't log large fields like profile images
    if (bodyClone.profileImage && bodyClone.profileImage.length > 100) {
      bodyClone.profileImage = `[Base64 image data - ${bodyClone.profileImage.length} chars]`
    }
    console.log("Request body:", bodyClone)
  }
  next()
})

// Connect to MongoDB with better error handling
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    // Write to a file that Vercel can access in the logs
    try {
      fs.writeFileSync("/tmp/mongodb-error.log", JSON.stringify(err, null, 2))
    } catch (fileErr) {
      console.error("Could not write to error log file:", fileErr)
    }
  })

// API routes
app.use("/api/auth", authRoutes)

// Test route to verify server is working
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" })
})

// Add a detailed health check endpoint
app.get("/api/health", (req, res) => {
  try {
    const health = {
      status: "ok",
      timestamp: new Date(),
      environment: process.env.NODE_ENV,
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env_vars: {
        NODE_ENV: process.env.NODE_ENV,
        // Don't include sensitive variables like MONGODB_URI or JWT_SECRET
        MONGODB_URI: process.env.MONGODB_URI ? "set" : "not set",
        JWT_SECRET: process.env.JWT_SECRET ? "set" : "not set",
        EMAIL_USER: process.env.EMAIL_USER ? "set" : "not set",
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "set" : "not set",
        CLIENT_URL: process.env.CLIENT_URL || "not set",
      },
    }
    res.status(200).json(health)
  } catch (error) {
    console.error("Error in health check endpoint:", error)
    res.status(500).json({ message: "Health check failed", error: error.message })
  }
})

// Root route for testing
app.get("/", (req, res) => {
  res.json({ message: "MERN Auth API is running!" })
})

// Route debugging - log all registered routes
console.log("Registered routes:")
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    // Routes registered directly on the app
    console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`)
  } else if (middleware.name === "router") {
    // Router middleware
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        const path = handler.route.path
        const methods = Object.keys(handler.route.methods)
        console.log(`${methods} /api/auth${path}`)
      }
    })
  }
})

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // In Vercel, we don't need to serve static files here
  // as Vercel handles this through the vercel.json configuration

  // But we still need to handle API routes
  app.all("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      next()
    } else {
      // For non-API routes, let Vercel handle it
      res.status(404).json({ message: "API route not found" })
    }
  })
} else {
  // For local development, serve static files
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  app.use(express.static(path.join(__dirname, "../client/dist")))

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"))
  })
}

// Error handling middleware - MUST be placed after all routes
app.use((err, req, res, next) => {
  console.error("Server error:", err)

  // Log error to a file that Vercel can access
  try {
    fs.writeFileSync(
      "/tmp/server-error.log",
      JSON.stringify(
        {
          message: err.message,
          stack: err.stack,
          time: new Date().toISOString(),
          path: req.path,
          method: req.method,
          headers: req.headers,
        },
        null,
        2,
      ),
    )
  } catch (fileErr) {
    console.error("Could not write error to file:", fileErr)
  }

  // Send more detailed error in development
  if (process.env.NODE_ENV !== "production") {
    return res.status(500).json({
      message: "Something went wrong!",
      error: err.message,
      stack: err.stack,
    })
  }

  // Send generic error in production
  res.status(500).json({ message: "Something went wrong!" })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api/auth`)
})
