/**
 * lib/shiprocket/auth.ts — Token Management & Auto-Refresh for Shiprocket API
 */

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

interface TokenCache {
  token: string;
  expiresAt: number; // Unix timestamp in ms
}

let cachedToken: TokenCache | null = null;

/**
 * Retrieves valid Shiprocket Bearer Token, reusing cached token if valid.
 * Shiprocket tokens last 10 days; we cache for 9 days for safety.
 */
export async function getShiprocketToken(): Promise<string | null> {
  // Return cached token if valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const email = process.env.SHIPROCKET_API_EMAIL || process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_API_PASSWORD || process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    console.warn(
      "[Shiprocket Auth] SHIPROCKET_API_EMAIL or SHIPROCKET_API_PASSWORD environment variable is not configured."
    );
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Shiprocket Auth Failed]", res.status, errText);
      return null;
    }

    const data = await res.json();
    if (data && data.token) {
      cachedToken = {
        token: data.token,
        // Cache for 9 days (9 * 24 * 60 * 60 * 1000 ms)
        expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000,
      };
      return data.token;
    }
  } catch (error) {
    console.error("[Shiprocket Auth Network Error]", error);
  }

  return null;
}

/**
 * Invalidates the cached token (e.g. upon receiving a 401 Unauthorized from API).
 */
export function invalidateShiprocketToken(): void {
  cachedToken = null;
}
