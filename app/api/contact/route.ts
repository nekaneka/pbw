import { NextRequest, NextResponse } from "next/server";
import { SITE } from "@/lib/site";
import { rateLimit, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/contact → sends the contact form via Resend to the provider.
 * Without RESEND_API_KEY the message is logged to the server console.
 */
export async function POST(req: NextRequest) {
  if (!rateLimit(req, "contact", 5, 10 * 60_000)) {
    return NextResponse.json({ error: RATE_LIMITED_MESSAGE }, { status: 429 });
  }

  let body: { name?: string; email?: string; phone?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Bitte füllen Sie Name, E-Mail und Nachricht aus." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Bitte geben Sie eine gültige E-Mail-Adresse an." }, { status: 400 });
  }

  const text = [
    `Neue Kontaktanfrage über die Website:`,
    ``,
    `Name: ${name}`,
    `E-Mail: ${email}`,
    `Telefon: ${phone || "-"}`,
    ``,
    `Nachricht:`,
    message,
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.PROVIDER_EMAIL ?? SITE.email;

  if (!apiKey || !from) {
    console.log(`[contact form – e-mail skipped, RESEND_API_KEY/EMAIL_FROM not set]\n${text}`);
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Kontaktanfrage von ${name}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error(`Resend error ${res.status}: ${await res.text()}`);
      return NextResponse.json({ error: "Nachricht konnte nicht gesendet werden." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Nachricht konnte nicht gesendet werden." }, { status: 500 });
  }
}
