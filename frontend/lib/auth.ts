import { BACKEND_URL, TOKEN_COOKIE_NAME, REFRESH_COOKIE_NAME } from "./constants";
import { cookies } from "next/headers";

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name?: string;
    email: string;
    role?: string;
  };
};

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const baseHeaders = { "Content-Type": "application/json" };

/**
 * Extract a user-friendly error message from backend response
 */
function extractErrorMessage(errorBody: any, fallback: string): string {
  if (!errorBody) return fallback;
  
  // NestJS returns { message: string | string[], error: string, statusCode: number }
  if (errorBody.message) {
    // If message is an array (validation errors), join them
    if (Array.isArray(errorBody.message)) {
      return errorBody.message.join('. ');
    }
    return errorBody.message;
  }
  
  return fallback;
}

export async function loginRequest(body: { email: string; password: string }) {
  const res = await fetch(`${BACKEND_URL}/auth/signin`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message = extractErrorMessage(errorBody, "Login failed. Please try again.");
    throw new HttpError(message, res.status);
  }
  return (await res.json()) as AuthResponse;
}

export async function registerRequest(body: { email: string; password: string; name: string }) {
  const res = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message = extractErrorMessage(errorBody, "Registration failed. Please try again.");
    throw new HttpError(message, res.status);
  }
  return (await res.json()) as AuthResponse;
}

export function setLegacyTokenCookie(token: string) {
  const isSecure = (process.env.NEXT_PUBLIC_APP_URL ?? "").startsWith("https");
  cookies().set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
  });
}

export function clearLegacyTokenCookie() {
  cookies().delete(TOKEN_COOKIE_NAME);
}

export function setRefreshTokenCookie(token: string) {
  const isSecure = (process.env.NEXT_PUBLIC_APP_URL ?? "").startsWith("https");
  cookies().set(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
  });
}

export function clearRefreshTokenCookie() {
  cookies().delete(REFRESH_COOKIE_NAME);
}
