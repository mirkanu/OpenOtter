import { NextResponse } from "next/server";
import { generateState } from "@/lib/notion-auth";

// Disable caching for OAuth endpoint
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Validate required environment variables
    const clientId = process.env.NOTION_CLIENT_ID;
    const redirectUri = process.env.NOTION_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: "Notion OAuth not configured. Missing NOTION_CLIENT_ID or NOTION_REDIRECT_URI." },
        { status: 500 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = generateState();

    // Construct OAuth authorization URL
    const authUrl = new URL('https://api.notion.com/v1/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('owner', 'user');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    // Store state in cookie for callback validation
    // Set secure cookie for production, lax for development
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieString = `notion_oauth_state=${state}; Path=/; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Max-Age=600`;

    // Redirect user to Notion authorization screen
    const response = NextResponse.redirect(authUrl.toString());
    response.headers.set('Set-Cookie', cookieString);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("OAuth authorization failed:", error);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}