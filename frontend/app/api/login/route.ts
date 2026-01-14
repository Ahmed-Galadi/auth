import { NextRequest } from "next/server";
import { createSession, clearSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import {
  clearLegacyTokenCookie,
  clearRefreshTokenCookie,
  loginRequest,
  setLegacyTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ message: "Please provide a valid email and password." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await loginRequest(parsed.data);

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
  } catch (error: unknown) {
    const status = (error as any)?.status ?? 500;
    const message = error instanceof Error ? error.message : "Login failed. Please try again.";
    return new Response(JSON.stringify({ message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
