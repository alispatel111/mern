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

// Global connection variable to reuse connections
let cachedConnection = null

// Connect to MongoDB with connection reuse for serverless
const connectToDatabase = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using cached MongoDB connection")
    return cachedConnection
  }

  try {
    console.log("Creating new MongoDB connection...")
    
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    })

    cachedConnection = connection
    console.log("Connected to MongoDB successfully")
    return connection
  } catch (error) {
    console.error("MongoDB connection error:", error)
    cachedConnection = null
    throw error
  }
}

// Create Express app
const app = express()

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
)

// Increase the body parser limit to handle larger payloads (like base64 images)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Database connection middleware - ensure connection before each request
app.use(async (req, res, next) => {
  try {
    await connectToDatabase()
    next()
  } catch (error) {
    console.error("Database connection failed:", error)
    return res.status(500).json({ 
      message: "Database connection failed", 
      error: error.message 
    })
  }
})

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`)
  
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

// API routes
app.use("/api/auth", authRoutes)

// Test route to verify server is working
app.get("/api/test", async (req, res) => {
  try {
    // Test database connection
    const dbState = mongoose.connection.readyState
    const dbStatus = dbState === 1 ? "connected" : "disconnected"
    
    res.json({ 
      message: "Server is working!",
      database: dbStatus,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ 
      message: "Server test failed", 
      error: error.message 
    })
  }
})

// Add a detailed health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Ensure database connection
    await connectToDatabase()
    
    const health = {
      status: "ok",
      timestamp: new Date(),
      environment: process.env.NODE_ENV,
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      mongodb_state: mongoose.connection.readyState,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env_vars: {
        NODE_ENV: process.env.NODE_ENV,
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
    res.status(500).json({ 
      message: "Health check failed", 
      error: error.message,
      mongodb: "disconnected"
    })
  }
})

// Root route for testing
app.get("/", async (req, res) => {
  try {
    await connectToDatabase()
    res.json({ 
      message: "MERN Auth API is running!",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      version: "1.0.0"
    })
  } catch (error) {
    res.status(500).json({ 
      message: "MERN Auth API is running but database connection failed!",
      error: error.message
    })
  }
})

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // In Vercel, we don't serve static files from backend
  // Handle only API routes
  app.all("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      next()
    } else {
      // For non-API routes in production, return API info
      res.json({ 
        message: "MERN Auth API is running!",
        version: "1.0.0",
        endpoints: ["/api/auth", "/api/health", "/api/test"]
      })
    }
  })
} else {
  // For local development, serve static files
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const clientPath = path.join(__dirname, "../client/dist")
  
  if (fs.existsSync(clientPath)) {
    app.use(express.static(clientPath))
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientPath, "index.html"))
    })
  } else {
    app.get("*", (req, res) => {
      res.json({ message: "Client build not found. Run 'npm run build' in client directory." })
    })
  }
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

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing MongoDB connection...')
  await mongoose.connection.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing MongoDB connection...')
  await mongoose.connection.close()
  process.exit(0)
})

// Start server
const PORT = process.env.PORT || 5000

// Initialize database connection on startup
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`API available at http://localhost:${PORT}/api/auth`)
    })
  })
  .catch((error) => {
    console.error("Failed to start server:", error)
    process.exit(1)
  })

// Export for Vercel
export default app
