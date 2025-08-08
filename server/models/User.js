import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        // Password is required only if googleId is not provided
        return !this.googleId
      },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // OTP for password reset
    resetOTP: String,
    resetOTPExpires: Date,
    // Google OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Email verification fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    // Additional profile fields
    phone: {
      type: String,
      default: "",
    },
    birthday: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "New York, USA",
    },
    bio: {
      type: String,
      default: "I'm a software developer with a passion for creating amazing user experiences.",
    },
    occupation: {
      type: String,
      default: "Software Developer",
    },
    website: {
      type: String,
      default: "https://example.com",
    },
    joinDate: {
      type: String,
      default: () => new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    },
    profileImage: {
      type: String,
      default: "",
    },
    socialLinks: {
      twitter: {
        type: String,
        default: "https://twitter.com/username",
      },
      linkedin: {
        type: String,
        default: "https://linkedin.com/in/username",
      },
      github: {
        type: String,
        default: "https://github.com/username",
      },
    },
  },
  { timestamps: true },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model("User", userSchema)

export default User
