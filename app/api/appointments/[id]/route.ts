import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { isAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/appointments/:id → admin only: hard-deletes a slot.
 * Booked appointments are refused (409) – they must be cancelled instead
 * so the customer data stays in the history.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const { id } = await params;
  try {
    const result = await getStore().delete(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Termin konnte nicht gelöscht werden." }, { status: 500 });
  }
}

/**
 * PATCH /api/appointments/:id  Body: { status: "cancelled" }
 * Admin cancellation of a booked, future appointment. The record and all
 * customer data remain visible in the admin history.
 * Public customers can never cancel by ID – only via their secret token
 * (POST /api/appointments/cancel).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const { id } = await params;

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  if (body.status !== "cancelled") {
    return NextResponse.json(
      { error: "Nur die Statusänderung auf „cancelled“ wird unterstützt." },
      { status: 400 }
    );
  }

  try {
    const result = await getStore().cancelByAdmin(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true, appointment: result.data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Stornierung fehlgeschlagen." }, { status: 500 });
  }
}
