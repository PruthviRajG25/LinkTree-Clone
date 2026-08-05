import { NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 1. Basic validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: "All fields (name, email, password) are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const client = await clientPromise;
    const db = client.db("linktree");

    const existingUser = await db.collection("users").findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already registered! Please log in." },
        { status: 400 }
      );
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User Record
    // Default username is the left part of the email address
    const baseUsername = normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "");
    const newUser = {
      email: normalizedEmail,
      password: hashedPassword,
      name: name.trim(),
      username: baseUsername || "user",
      githubId: null,
      handle: null,
      createdAt: new Date(),
    };

    const insertResult = await db.collection("users").insertOne(newUser);
    const userId = insertResult.insertedId;

    // 5. Generate Session Token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days session longevity

    await db.collection("sessions").insertOne({
      sessionToken,
      userId: userId.toString(),
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
      message: "Account successfully created!",
    });
  } catch (error) {
    console.error("Signup API Route Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
