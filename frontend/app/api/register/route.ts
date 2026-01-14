import { NextRequest } from "next/server";
import { registerSchema } from "@/lib/validation";
import {
  clearLegacyTokenCookie,
  clearRefreshTokenCookie,
  registerRequest,
  setLegacyTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/auth";
import { createSession, clearSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ message: "Invalid registration data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await registerRequest(parsed.data);

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
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const status = (error as any)?.status ?? 400;
    const message = error instanceof Error ? error.message : "Registration failed";
    return new Response(JSON.stringify({ message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
