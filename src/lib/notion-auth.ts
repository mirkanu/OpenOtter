import { Client } from '@notionhq/client';

/**
 * Generate cryptographically secure random state for OAuth CSRF protection
 * @returns 32-character hexadecimal string
 */
export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate OAuth state parameter to prevent CSRF attacks
 * @param state - State parameter from callback
 * @param expectedState - Original state from authorization request
 * @returns true if states match
 */
export function validateState(state: string, expectedState: string): boolean {
  return state === expectedState;
}

/**
 * Exchange OAuth authorization code for access token
 * @param code - Authorization code from Notion OAuth callback
 * @returns Token response with access_token and optional refresh_token
 */
export async function exchangeCodeForToken(code: string) {
  const response = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(
        `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.NOTION_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();

  // Store access token in environment for single-user case
  // In production, user must manually update .env.production file
  // In development, update .env.local file
  process.env.NOTION_ACCESS_TOKEN = data.access_token;

  return data;
}