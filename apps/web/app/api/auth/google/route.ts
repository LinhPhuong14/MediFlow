import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Google Auth API called");

    const { token: googleToken } = await req.json();

    if (!googleToken) {
      return NextResponse.json(
        { message: "Missing Google token" },
        { status: 400 }
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      console.log("❌ Email missing in verified token");
      return NextResponse.json(
        { message: "Email not found in Google token" },
        { status: 400 }
      );
    }

    const email = payload.email;
    const name = payload.name || email.split("@")[0];
    const image = payload.picture || null;

    console.log("🔍 Verified Google user:", { email, name, hasImage: !!image });

    // Connect to database
    console.log("🔌 Connecting to database...");
    await dbConnect();
    console.log("✅ Database connected");

    // Check environment variables
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET not found in environment variables");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Find existing user or create new one
    console.log("👤 Looking for existing user with email:", email);
    let user = await User.findOne({ email });

    if (!user) {
      console.log("👤 User not found, creating new user...");
      try {
        user = await User.create({
          name: name || email.split("@")[0], // Fallback name
          email,
          image: image || null,
          provider: "google",
          preferences: {
            difficulty: "beginner",
            practiceGoals: ["ielts"],
            reminderEnabled: false,
            voiceSettings: {
              gender: "female",
              accent: "american",
              speed: "normal",
              feedback: true,
            },
          },
          statistics: {
            totalSessions: 0,
            totalPracticeTime: 0,
            averageScore: 0,
            lastActive: new Date(),
          },
        });
        console.log("✅ New user created:", user._id);
      } catch (createError) {
        console.error("❌ Error creating user:", createError);
        return NextResponse.json(
          { message: "Failed to create user", error: createError.message },
          { status: 500 }
        );
      }
    } else {
      console.log("✅ Existing user found:", user._id);
      // Update last active time for existing user
      try {
        user.statistics = user.statistics || {};
        user.statistics.lastActive = new Date();
        await user.save();
        console.log("✅ User lastActive updated");
      } catch (updateError) {
        console.error("⚠️ Warning: Could not update lastActive:", updateError);
        // Don't fail the login for this
      }
    }

    // Generate JWT token
    console.log("🔐 Generating JWT token...");
    const jwtToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    console.log("✅ JWT token generated");

    // Create response with user data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.image, // Map image to picture for compatibility
      provider: user.provider,
      preferences: user.preferences,
      statistics: user.statistics,
    };

    console.log("📤 Sending response with user data");

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged in successfully",
        user: userData,
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set({
      name: "token",
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log("✅ Cookie set, returning response");
    return response;
  } catch (error) {
    console.error("❌ Google auth error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: "Method GET not allowed. Use POST." },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: "Method PUT not allowed. Use POST." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: "Method DELETE not allowed. Use POST." },
    { status: 405 }
  );
}