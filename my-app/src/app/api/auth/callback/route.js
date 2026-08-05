import { NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "No code provided from GitHub OAuth." }, { status: 400 });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "GitHub credentials not configured in environment." }, { status: 500 });
    }

    // Determine protocol and host dynamically
    const host = request.headers.get("host");
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const redirectUri = `${protocol}://${host}/api/auth/callback`;

    // 1. Exchange code for GitHub Access Token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Access Token Exchange Error:", tokenData);
      return NextResponse.json({ error: tokenData.error_description || "Token exchange failed." }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile from GitHub API
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "User-Agent": "BitTree-Clone-App",
      },
    });

    const githubUser = await userResponse.json();

    if (!githubUser.id) {
      console.error("Failed to fetch GitHub user:", githubUser);
      return NextResponse.json({ error: "Failed to retrieve user profile from GitHub." }, { status: 400 });
    }

    // 3. Connect to DB and search/create User
    const client = await clientPromise;
    const db = client.db("linktree");

    let user = await db.collection("users").findOne({ githubId: githubUser.id });
    let userId;

    if (!user) {
      // User doesn't exist yet, insert them
      const newUser = {
        githubId: githubUser.id,
        username: githubUser.login.toLowerCase(),
        name: githubUser.name || githubUser.login,
        email: githubUser.email || "",
        avatarUrl: githubUser.avatar_url,
        handle: null, // unclaimed initially
        createdAt: new Date(),
      };
      const insertResult = await db.collection("users").insertOne(newUser);
      userId = insertResult.insertedId;
    } else {
      // Update existing user properties to stay synchronized
      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            username: githubUser.login.toLowerCase(),
            name: githubUser.name || githubUser.login,
            avatarUrl: githubUser.avatar_url,
          },
        }
      );
      userId = user._id;
    }

    // 4. Create a Session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days session longevity

    await db.collection("sessions").insertOne({
      sessionToken,
      userId: userId.toString(),
      createdAt: new Date(),
      expiresAt,
    });

    // 5. Set cookie and redirect to dashboard
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    // Redirect to the dynamic generate path
    const destinationUrl = new URL("/generate", request.url);
    return NextResponse.redirect(destinationUrl);
  } catch (error) {
    console.error("OAuth Callback Handler Error:", error);
    return NextResponse.json({ error: "Authentication failed due to internal error." }, { status: 500 });
  }
}
