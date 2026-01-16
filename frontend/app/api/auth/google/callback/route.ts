import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/constants";
import {
  clearLegacyTokenCookie,
  clearRefreshTokenCookie,
  setLegacyTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/auth";
import { createSession, clearSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json(
      { message: "Google authentication was cancelled or failed." },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { message: "No authorization code received from Google." },
      { status: 400 }
    );
  }

  try {
    // Forward the callback to the backend
    const backendUrl = `${BACKEND_URL}/auth/google/callback?${searchParams.toString()}`;
    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const message = errorData?.message || "Failed to authenticate with Google.";
      return NextResponse.json({ message }, { status: res.status });
    }

    const data = await res.json();

    // Clear any existing sessions
    clearSession();
    clearLegacyTokenCookie();
    clearRefreshTokenCookie();

    // Create new session
    await createSession({
      sub: data.user.id,
      email: data.user.email,
      role: data.user.role,
    });

    // Set token cookies
    setLegacyTokenCookie(data.accessToken);
    setRefreshTokenCookie(data.refreshToken);

    return NextResponse.json({ user: data.user }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Google authentication failed. Please try again.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
