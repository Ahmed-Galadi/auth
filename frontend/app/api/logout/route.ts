import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, TOKEN_COOKIE_NAME } from "@/lib/constants";

export async function POST(_req: NextRequest) {
  const token = _req.cookies.get(TOKEN_COOKIE_NAME)?.value;
  if (token) {
    await fetch(`${BACKEND_URL}/auth/signout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("session");
  response.cookies.delete("token");
  response.cookies.delete("refreshToken");

  return response;
}
