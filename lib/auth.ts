/**
 * Simple, dependency-free admin authentication.
 *
 * The admin (provider) logs in with a single password (ADMIN_PASSWORD env
 * var). On success an HttpOnly session cookie is set whose value is an
 * HMAC derived from the password – it cannot be guessed and becomes
 * invalid as soon as the password is changed.
 *
 * This is intentionally minimal for a single-admin site. When the project
 * moves to Supabase Auth, replace isAdminRequest() with a Supabase session
 * check – all API routes already call through this one function.
 */
import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "pbw_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function isAuthConfigured(): boolean {
  return adminPassword().length >= 8;
}

/** Deterministic session token – changes whenever the password changes. */
export function sessionToken(): string {
  return createHmac("sha256", adminPassword())
    .update("pbw-admin-session-v1")
    .digest("hex");
}

/** Constant-time comparison of two strings of arbitrary length. */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function verifyPassword(input: string): boolean {
  return isAuthConfigured() && safeEqual(input, adminPassword());
}

/** True if the request carries a valid admin session cookie. */
export function isAdminRequest(req: NextRequest): boolean {
  if (!isAuthConfigured()) return false;
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!cookie) return false;
  return safeEqual(cookie, sessionToken());
}
