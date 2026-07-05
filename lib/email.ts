/**
 * Transactional e-mails via Resend (https://resend.com).
 * Uses the plain REST API, so no npm dependency is required.
 *
 * Without RESEND_API_KEY the mails are logged to the server console and
 * appended to ./.data/emails.log (best effort) instead – the booking itself
 * still succeeds, and the log lets local tests verify the mail content.
 */
import { promises as fs } from "fs";
import path from "path";
import type { Appointment } from "./types";
import { SITE } from "./site";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEV_MAIL_LOG = path.join(process.cwd(), ".data", "emails.log");

function formatSlot(a: Appointment): string {
  const start = new Date(a.start_time);
  const end = new Date(a.end_time);
  const date = start.toLocaleDateString("de-AT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Vienna",
  });
  const fmt: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Vienna",
  };
  return `${date}, ${start.toLocaleTimeString("de-AT", fmt)}–${end.toLocaleTimeString("de-AT", fmt)} Uhr`;
}

/** Public base URL for links inside e-mails. */
function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url).replace(/\/$/, "");
}

async function send(to: string, subject: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    const logEntry = `[email skipped – RESEND_API_KEY/EMAIL_FROM not set]\nTo: ${to}\nSubject: ${subject}\n\n${text}\n\n---\n`;
    console.log(logEntry);
    try {
      await fs.mkdir(path.dirname(DEV_MAIL_LOG), { recursive: true });
      await fs.appendFile(DEV_MAIL_LOG, logEntry, "utf-8");
    } catch {
      // Log file is a dev convenience only – never fail because of it.
    }
    return;
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!res.ok) {
    console.error(`Resend error ${res.status}: ${await res.text()}`);
  }
}

/**
 * Fire-and-forget confirmation mails after a successful booking.
 * The customer mail contains the secret cancellation link; the provider
 * notification deliberately does not.
 * Errors are logged but never break the booking response.
 */
export async function sendBookingEmails(a: Appointment): Promise<void> {
  const slot = formatSlot(a);
  const providerEmail = process.env.PROVIDER_EMAIL ?? SITE.email;
  const cancelUrl = a.cancel_token
    ? `${siteBaseUrl()}/termin/stornieren?token=${a.cancel_token}`
    : null;

  const customerText = [
    `Sehr geehrte/r ${a.customer_name},`,
    ``,
    `vielen Dank für Ihre Terminbuchung bei ${SITE.shortName}.`,
    ``,
    `Ihr Termin:`,
    `  ${slot}`,
    `  Art: ${a.appointment_type}`,
    `  Ort: ${a.location}`,
    `  Anliegen: ${a.customer_reason ?? "-"}`,
    ``,
    ...(cancelUrl
      ? [
          `Falls Sie den Termin nicht wahrnehmen können, können Sie ihn hier stornieren:`,
          `${cancelUrl}`,
          ``,
        ]
      : []),
    `Mit freundlichen Grüßen`,
    `${SITE.owner}`,
    `${SITE.shortName}`,
  ].join("\n");

  const providerText = [
    `Neue Terminbuchung:`,
    ``,
    `  ${slot}`,
    `  Art: ${a.appointment_type}`,
    `  Ort: ${a.location}`,
    ``,
    `Kundendaten:`,
    `  Name: ${a.customer_name}`,
    `  E-Mail: ${a.customer_email}`,
    `  Telefon: ${a.customer_phone}`,
    `  Anliegen: ${a.customer_reason ?? "-"}`,
    `  Nachricht: ${a.customer_message || "-"}`,
  ].join("\n");

  const results = await Promise.allSettled([
    a.customer_email
      ? send(a.customer_email, `Terminbestätigung – ${SITE.shortName}`, customerText)
      : Promise.resolve(),
    send(providerEmail, `Neue Buchung: ${slot}`, providerText),
  ]);
  for (const r of results) {
    if (r.status === "rejected") console.error("E-Mail-Versand fehlgeschlagen:", r.reason);
  }
}

/** Cancellation confirmations to customer and provider. */
export async function sendCancellationEmails(a: Appointment): Promise<void> {
  const slot = formatSlot(a);
  const providerEmail = process.env.PROVIDER_EMAIL ?? SITE.email;

  const customerText = [
    `Sehr geehrte/r ${a.customer_name},`,
    ``,
    `Ihr Termin wurde storniert:`,
    `  ${slot}`,
    `  Art: ${a.appointment_type}`,
    ``,
    `Wenn Sie einen neuen Termin wünschen, buchen Sie gerne unter:`,
    `${siteBaseUrl()}/termin`,
    ``,
    `Mit freundlichen Grüßen`,
    `${SITE.owner}`,
    `${SITE.shortName}`,
  ].join("\n");

  const providerText = [
    `Termin wurde storniert:`,
    ``,
    `  ${slot}`,
    `  Art: ${a.appointment_type}`,
    `  Kunde: ${a.customer_name} (${a.customer_email}, ${a.customer_phone})`,
  ].join("\n");

  const results = await Promise.allSettled([
    a.customer_email
      ? send(a.customer_email, `Terminstornierung – ${SITE.shortName}`, customerText)
      : Promise.resolve(),
    send(providerEmail, `Stornierung: ${slot}`, providerText),
  ]);
  for (const r of results) {
    if (r.status === "rejected") console.error("E-Mail-Versand fehlgeschlagen:", r.reason);
  }
}
