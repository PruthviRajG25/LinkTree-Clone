import { cookies } from "next/headers";
import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";

export async function verifySession() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return null;
    }

    const client = await clientPromise;
    const db = client.db("linktree");

    // Query the session
    const session = await db.collection("sessions").findOne({
      sessionToken,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return null;
    }

    // Query the user associated with the session
    let userQuery = null;
    if (ObjectId.isValid(session.userId)) {
      userQuery = { _id: new ObjectId(session.userId) };
    } else {
      userQuery = { _id: session.userId };
    }

    const user = await db.collection("users").findOne(userQuery);
    if (!user) {
      return null;
    }

    return {
      userId: user._id.toString(),
      githubId: user.githubId,
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      handle: user.handle || null,
    };
  } catch (error) {
    console.error("verifySession Error:", error);
    return null;
  }
}
