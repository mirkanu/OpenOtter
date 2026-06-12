import { NextRequest, NextResponse } from "next/server";
import { validateState, exchangeCodeForToken } from "@/lib/notion-auth";

// Disable caching for OAuth callback
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle user denial or OAuth error
    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        new URL('/notion/setup?error=oauth_denied', request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/notion/setup?error=invalid_callback', request.url)
      );
    }

    // Validate state parameter from cookie
    const stateCookie = request.cookies.get('notion_oauth_state')?.value;
    if (!stateCookie || !validateState(state, stateCookie)) {
      console.error("State mismatch error");
      return NextResponse.redirect(
        new URL('/notion/setup?error=state_mismatch', request.url)
      );
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Clear state cookie
    const response = NextResponse.redirect(
      new URL('/notion/setup?success=connected', request.url)
    );
    response.cookies.delete('notion_oauth_state');

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("OAuth callback failed:", error);

    return NextResponse.redirect(
      new URL(`/notion/setup?error=token_exchange_failed`, request.url)
    );
  }
}