import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { sendBookingEmails } from "@/lib/email";
import { BOOKING_REASONS, type BookingInput } from "@/lib/types";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/appointments/:id/book → customer books an open slot.
 *
 * Booking logic (server-side, client is never trusted):
 * 1. Validate customer data.
 * 2. The store checks that the slot still has status "open" –
 *    for Supabase this is an atomic conditional UPDATE, so two
 *    simultaneous bookings can never both succeed.
 * 3. On success the slot becomes "booked" and confirmation mails
 *    are sent to customer and provider (if Resend is configured).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: Partial<BookingInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const customer_name = body.customer_name?.trim() ?? "";
  const customer_email = body.customer_email?.trim() ?? "";
  const customer_phone = body.customer_phone?.trim() ?? "";
  const customer_reason = body.customer_reason?.trim() ?? "";
  const customer_message = body.customer_message?.trim() ?? "";

  if (!customer_name || !customer_email || !customer_phone || !customer_reason) {
    return NextResponse.json(
      { error: "Bitte füllen Sie Name, E-Mail, Telefon und Anliegen aus." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(customer_email)) {
    return NextResponse.json({ error: "Bitte geben Sie eine gültige E-Mail-Adresse an." }, { status: 400 });
  }
  if (!(BOOKING_REASONS as readonly string[]).includes(customer_reason)) {
    return NextResponse.json({ error: "Unbekanntes Anliegen." }, { status: 400 });
  }

  try {
    const result = await getStore().book(id, {
      customer_name,
      customer_email,
      customer_phone,
      customer_reason,
      customer_message,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    // E-mails must never break a successful booking.
    sendBookingEmails(result.data).catch((err) => console.error(err));

    return NextResponse.json({
      ok: true,
      appointment: {
        id: result.data.id,
        start_time: result.data.start_time,
        end_time: result.data.end_time,
        appointment_type: result.data.appointment_type,
        location: result.data.location,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Buchung fehlgeschlagen. Bitte versuchen Sie es erneut." }, { status: 500 });
  }
}
