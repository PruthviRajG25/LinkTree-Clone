import { NextResponse } from "next/server";
import { verifySession } from "../../../../../lib/auth";
import clientPromise from "../../../../../lib/mongodb";

export async function GET() {
  try {
    const user = await verifySession();

    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null, linktree: null },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    // Fetch the user's linktree data if they have one
    const client = await clientPromise;
    const db = client.db("linktree");
    const linktree = await db.collection("links").findOne({ userId: user.userId });

    return NextResponse.json(
      {
        authenticated: true,
        user,
        linktree: linktree
          ? {
              handle: linktree.handle,
              links: linktree.links,
              pic: linktree.pic,
              desc: linktree.desc,
            }
          : null,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Session API Route Error:", error);
    return NextResponse.json({ authenticated: false, error: "Internal server error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
