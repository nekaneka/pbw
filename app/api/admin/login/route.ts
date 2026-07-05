import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  isAuthConfigured,
  sessionToken,
  verifyPassword,
} from "@/lib/auth";
import { rateLimit, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** POST /api/admin/login → sets the admin session cookie. */
export async function POST(req: NextRequest) {
  // Brute-force protection: a handful of attempts per IP, then back off.
  if (!rateLimit(req, "login", 10, 10 * 60_000)) {
    return NextResponse.json({ error: RATE_LIMITED_MESSAGE }, { status: 429 });
  }

  if (!isAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "Admin-Login ist nicht konfiguriert. Bitte ADMIN_PASSWORD (mind. 8 Zeichen) in .env.local setzen.",
      },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  if (!body.password || !verifyPassword(body.password)) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return res;
}
