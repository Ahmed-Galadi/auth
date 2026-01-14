import { NextRequest } from "next/server";
import {
  clearLegacyTokenCookie,
  clearRefreshTokenCookie,
  setLegacyTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/auth";
import { createSession, clearSession } from "@/lib/session";
import { BACKEND_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (!refreshToken) {
    return new Response(JSON.stringify({ message: "Missing refresh token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    clearSession();
    clearLegacyTokenCookie();
    clearRefreshTokenCookie();
    return new Response(JSON.stringify({ message: data.message || "Refresh failed" }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  clearSession();
  clearLegacyTokenCookie();
  clearRefreshTokenCookie();

  await createSession({
    sub: data.user.id,
    email: data.user.email,
    role: data.user.role,
  });

  setLegacyTokenCookie(data.accessToken);
  setRefreshTokenCookie(data.refreshToken);

  return new Response(JSON.stringify({ user: data.user }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
