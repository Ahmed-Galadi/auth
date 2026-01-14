import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

interface SessionPayload {
  sub: string;
  email: string;
  role?: string;
}

const SESSION_COOKIE = "session";
const LEGACY_COOKIE = "token";

async function readSession(req: NextRequest): Promise<SessionPayload | null> {
  const sessionCookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(sessionCookie, new TextEncoder().encode(secret));
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      role: payload.role ? String(payload.role) : undefined,
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const session = await readSession(req);
  const legacyToken = req.cookies.get(LEGACY_COOKIE)?.value;
  const role = session?.role;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");

  const isAuthenticated = Boolean(session || legacyToken);

  if (!isAuthenticated && (isDashboard || isAdmin)) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isAuthPage) {
    const target = role === "ADMIN" ? "/admin" : "/dashboard";
    const targetUrl = new URL(target, req.url);
    return NextResponse.redirect(targetUrl);
  }

  if (isAuthenticated && isAdmin && role !== "ADMIN") {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/dashboard/:path*', '/admin/:path*'],
};
