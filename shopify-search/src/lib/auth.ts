interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

const TOKEN_URL = "https://api.shopify.com/auth/access_token";
const REFRESH_MARGIN_MS = 10 * 60 * 1000; // refresh 10 min before expiry

export async function getAccessToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt - REFRESH_MARGIN_MS) {
    return cachedToken;
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET environment variables"
    );
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Token request failed: ${response.status} ${response.statusText}`
    );
  }

  const data: TokenResponse = await response.json();

  cachedToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;

  return cachedToken;
}
