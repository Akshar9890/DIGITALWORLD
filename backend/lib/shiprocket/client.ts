/**
 * lib/shiprocket/client.ts — Authenticated HTTP Client for Shiprocket API
 */

import { getShiprocketToken, invalidateShiprocketToken } from "./auth";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

export interface ShiprocketRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  retries?: number;
}

export async function shiprocketRequest<T = any>(options: ShiprocketRequestOptions): Promise<{
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}> {
  const token = await getShiprocketToken();
  if (!token) {
    return {
      success: false,
      error: "Shiprocket credentials are not configured or authentication failed.",
      statusCode: 401,
    };
  }

  let url = `${BASE_URL}${options.endpoint.startsWith("/") ? "" : "/"}${options.endpoint}`;

  if (options.params) {
    const query = new URLSearchParams();
    for (const [key, val] of Object.entries(options.params)) {
      if (val !== undefined && val !== null) {
        query.append(key, String(val));
      }
    }
    const qs = query.toString();
    if (qs) {
      url += `?${qs}`;
    }
  }

  const maxRetries = options.retries ?? 2;
  let attempt = 0;

  while (attempt <= maxRetries) {
    attempt++;
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const res = await fetch(url, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      // If 401, invalidate cached token
      if (res.status === 401) {
        invalidateShiprocketToken();
        if (attempt <= maxRetries) {
          continue;
        }
        return {
          success: false,
          error: "Shiprocket token expired or unauthorized.",
          statusCode: 401,
        };
      }

      // If rate limited or server error, retry with exponential backoff
      if ([429, 500, 502, 503, 504].includes(res.status) && attempt <= maxRetries) {
        const delay = Math.pow(2, attempt) * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const errMsg =
          json?.message ||
          json?.error ||
          (json?.errors ? Object.values(json.errors).flat().join(", ") : null) ||
          `Shiprocket API responded with status ${res.status}`;
        return {
          success: false,
          error: errMsg,
          statusCode: res.status,
          data: json,
        };
      }

      return {
        success: true,
        data: json,
        statusCode: res.status,
      };
    } catch (err: any) {
      if (attempt <= maxRetries) {
        const delay = Math.pow(2, attempt) * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      return {
        success: false,
        error: err.message || "Shiprocket network request failed",
        statusCode: 500,
      };
    }
  }

  return {
    success: false,
    error: "Maximum retries exceeded communicating with Shiprocket.",
    statusCode: 500,
  };
}
