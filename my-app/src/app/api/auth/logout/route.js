import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "../../../../../lib/mongodb";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (sessionToken) {
      // Connect to DB and remove the session token
      const client = await clientPromise;
      const db = client.db("linktree");
      await db.collection("sessions").deleteOne({ sessionToken });
    }

    // Set cookie expiration to immediate to clear it from browser
    cookieStore.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0), // expires immediately
      path: "/",
    });

    const homepageUrl = new URL("/", request.url);
    return NextResponse.redirect(homepageUrl);
  } catch (error) {
    console.error("Logout API Route Error:", error);
    // Even on error, attempt redirect to main home
    const homepageUrl = new URL("/", request.url);
    return NextResponse.redirect(homepageUrl);
  }
}
