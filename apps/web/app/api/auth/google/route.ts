import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Google Auth API called")

    const { token: googleToken } = await req.json()

    if (!googleToken) {
      return NextResponse.json(
        { message: "Missing Google token" },
        { status: 400 }
      )
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    if (!payload?.email) {
      return NextResponse.json(
        { message: "Email not found in Google token" },
        { status: 400 }
      )
    }

    const email = payload.email.toLowerCase()
    const name = payload.name || email.split("@")[0]

    console.log("🔍 Google user verified:", { email, name })

    // DB connect
    await dbConnect()

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET missing")
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      )
    }

    // Find user
    let user = await User.findOne({ email })

    // Create if not exists
    if (!user) {
      console.log("👤 Creating new ADMIN_DOCTOR user")

      user = new User({
        name,
        email,
        role: "ADMIN_DOCTOR",
        status: "ACTIVE",
        departmentId: null,
        doctorCode: null
      })

      await user.save()
      console.log("✅ New user created:", user._id)
    } else {
      console.log("✅ Existing user logged in:", user._id)

      // Optional: block inactive users
      if (user.status === "INACTIVE") {
        return NextResponse.json(
          { message: "Account is inactive" },
          { status: 403 }
        )
      }
    }

    // JWT
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    // Response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          departmentId: user.departmentId,
          doctorCode: user.doctorCode,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    )

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    })

    return response
  } catch (error: any) {
    console.error("❌ Google auth error:", error)

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message
      },
      { status: 500 }
    )
  }
}

/* =======================
   Block other methods
======================= */

export async function GET() {
  return NextResponse.json(
    { message: "Method not allowed" },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { message: "Method not allowed" },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { message: "Method not allowed" },
    { status: 405 }
  )
}
