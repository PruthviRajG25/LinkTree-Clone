import { NextResponse } from "next/server";

export async function GET(request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  
  if (!clientId) {
    return NextResponse.json(
      { error: "GITHUB_CLIENT_ID is not configured in environment variables." },
      { status: 500 }
    );
  }

  // Determine host and protocol dynamically to support local development and deployment
  const host = request.headers.get("host");
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/auth/callback`;

  // Generate GitHub Authorize URL
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=user:email`;

  return NextResponse.redirect(githubAuthUrl);
}
