import mongoose, { Schema, Document, Model } from "mongoose"
import bcrypt from "bcryptjs"

/* =======================
   Interfaces
======================= */

export type UserRole = "ADMIN_SUPER" | "ADMIN_DOCTOR"

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  role: UserRole
  // chỉ dùng cho ADMIN_DOCTOR
  departmentId?: string
  doctorCode?: string
  status: "ACTIVE" | "INACTIVE"
  createdAt: Date
  updatedAt: Date
  // methods
  comparePassword(password: string): Promise<boolean>
  isSuperAdmin(): boolean
  isDoctorAdmin(): boolean
}

/* =======================
   Schema
======================= */

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"]
    },

    password: {
      type: String,
      select: false,
      minlength: 6
    },

    role: {
      type: String,
      enum: ["ADMIN_SUPER", "ADMIN_DOCTOR"],
      required: true
    },

    departmentId: {
      type: String,
      default: null,
      index: true
    },

    doctorCode: {
      type: String,
      default: null,
      index: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

/* =======================
   Indexes
======================= */

userSchema.index({ role: 1 })
userSchema.index({ departmentId: 1 })

/* =======================
   Hooks
======================= */

userSchema.pre("save", async function (this: IUser, next: (err?: Error) => void) {
  if (!this.isModified("password") || !this.password) return next()

  try {
    this.password = await bcrypt.hash(this.password, 12)
    next()
  } catch (err) {
    next(err as Error)
  }
})

/* =======================
   Methods
======================= */

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(password, this.password)
}

userSchema.methods.isSuperAdmin = function (): boolean {
  return this.role === "ADMIN_SUPER"
}

userSchema.methods.isDoctorAdmin = function (): boolean {
  return this.role === "ADMIN_DOCTOR"
}

/* =======================
   Safe Model Export
======================= */

let User: Model<IUser>

try {
  User = mongoose.model<IUser>("User")
} catch {
  User = mongoose.model<IUser>("User", userSchema)
}

export default User
