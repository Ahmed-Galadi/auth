export const SESSION_COOKIE_NAME = "session";
export const TOKEN_COOKIE_NAME = "token"; // access token cookie
export const REFRESH_COOKIE_NAME = "refreshToken";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
