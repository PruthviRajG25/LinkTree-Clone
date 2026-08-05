import { NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Query User
    const client = await clientPromise;
    const db = client.db("linktree");
    const user = await db.collection("users").findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 400 }
      );
    }

    // 3. Verify they have a password (signed up via email, not just GitHub)
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "This account was created using GitHub. Please log in using the GitHub option.",
        },
        { status: 400 }
      );
    }

    // 4. Compare Password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 400 }
      );
    }

    // 5. Generate Session Token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days session longevity

    await db.collection("sessions").insertOne({
      sessionToken,
      userId: user._id.toString(),
      createdAt: new Date(),
      expiresAt,
    });

    // 6. Set HTTP-only Cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Logged in successfully!",
    });
  } catch (error) {
    console.error("Login API Route Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
