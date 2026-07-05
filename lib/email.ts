/**
 * Transactional e-mails via Resend (https://resend.com).
 * Uses the plain REST API, so no npm dependency is required.
 * Without RESEND_API_KEY the mails are logged to the server console
 * instead – the booking itself still succeeds.
 */
import type { Appointment } from "./types";
import { SITE } from "./site";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

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

async function send(to: string, subject: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.log(`[email skipped – RESEND_API_KEY/EMAIL_FROM not set]\nTo: ${to}\nSubject: ${subject}\n\n${text}`);
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
 * Errors are logged but never break the booking response.
 */
export async function sendBookingEmails(a: Appointment): Promise<void> {
  const slot = formatSlot(a);
  const providerEmail = process.env.PROVIDER_EMAIL ?? SITE.email;

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
    `Sollten Sie den Termin nicht wahrnehmen können, kontaktieren Sie uns bitte rechtzeitig.`,
    ``,
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
