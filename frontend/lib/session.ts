import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, APP_URL } from "./constants";

type SessionPayload = {
  sub: string | number;
  email: string;
  role?: string;
};

const getSecret = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is missing");
  }
  return new TextEncoder().encode(secret);
};

export async function createSession(payload: SessionPayload) {
  const isSecure = APP_URL.startsWith("https");
  const jwt = await new SignJWT({
    ...payload,
    sub: String(payload.sub),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());

  cookies().set(SESSION_COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}
