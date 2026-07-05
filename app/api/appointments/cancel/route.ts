import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { sendCancellationEmails } from "@/lib/email";
import { rateLimit, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";
import { toCancellationResult } from "@/lib/types";

export const dynamic = "force-dynamic";

// 64 hex chars – exactly what createCancelToken() produces.
const TOKEN_RE = /^[0-9a-f]{64}$/;

/**
 * POST /api/appointments/cancel  Body: { token }
 *
 * Customer cancellation via the secret link from the confirmation e-mail.
 * No login required – the unguessable token is the proof of ownership.
 * Only booked, future appointments can be cancelled; the response never
 * contains customer data, and error messages never reveal whether a
 * token exists.
 */
export async function POST(req: NextRequest) {
  if (!rateLimit(req, "cancel", 20, 10 * 60_000)) {
    return NextResponse.json({ error: RATE_LIMITED_MESSAGE }, { status: 429 });
  }

  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!TOKEN_RE.test(token)) {
    return NextResponse.json(
      { error: "Der Stornierungslink ist ungültig oder abgelaufen. Bitte kontaktieren Sie uns direkt." },
      { status: 404 }
    );
  }

  try {
    const result = await getStore().cancelByToken(token);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    // E-mails must never break a successful cancellation.
    sendCancellationEmails(result.data).catch((err) => console.error(err));

    return NextResponse.json({ ok: true, appointment: toCancellationResult(result.data) });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Stornierung fehlgeschlagen. Bitte versuchen Sie es erneut." },
      { status: 500 }
    );
  }
}
