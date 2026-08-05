import clientPromise from "../../../../lib/mongodb";
import { verifySession } from "../../../../lib/auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    // 1. Verify User Session
    const user = await verifySession();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { handle, links, pic, desc } = body;

    // Validation
    if (!handle) {
      return NextResponse.json(
        { success: false, message: "Handle is required." },
        { status: 400 }
      );
    }

    const normalizedHandle = handle.trim().toLowerCase();

    // Check for valid handle format (alphanumeric, underscores, hyphens, no spaces)
    const handleRegex = /^[a-zA-Z0-9_-]+$/;
    if (!handleRegex.test(normalizedHandle)) {
      return NextResponse.json(
        { success: false, message: "Handle must contain only letters, numbers, hyphens, and underscores." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("linktree");
    const collection = db.collection("links");

    // 2. Check if the handle is claimed by SOMEONE ELSE
    const existing = await collection.findOne({
      handle: normalizedHandle,
      userId: { $ne: user.userId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Handle is already claimed! Choose another one." },
        { status: 400 }
      );
    }

    // Clean links
    const cleanLinks = links
      ? links.filter((item) => item.linktext.trim() !== "" && item.link.trim() !== "")
      : [];

    // 3. Upsert the linktree details associated with this user ID
    await collection.updateOne(
      { userId: user.userId },
      {
        $set: {
          handle: normalizedHandle,
          links: cleanLinks,
          pic: pic.trim(),
          desc: desc.trim(),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // 4. Update the user record in users collection to keep handle updated
    let userQuery = null;
    if (ObjectId.isValid(user.userId)) {
      userQuery = { _id: new ObjectId(user.userId) };
    } else {
      userQuery = { _id: user.userId };
    }

    await db.collection("users").updateOne(userQuery, {
      $set: { handle: normalizedHandle },
    });

    return NextResponse.json({
      success: true,
      message: "Your BitTree has been successfully updated!",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error: " + error.message },
      { status: 500 }
    );
  }
}
