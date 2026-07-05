import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { isAdminRequest } from "@/lib/auth";
import { APPOINTMENT_TYPES, toPublicSlot, type CreateSlotInput } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/appointments          → public: only open, future slots (no customer data)
 * GET /api/appointments?scope=all → admin only: everything incl. customer data
 */
export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope");
  const store = getStore();

  try {
    if (scope === "all") {
      if (!isAdminRequest(req)) {
        return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
      }
      const all = await store.listAll();
      return NextResponse.json(all);
    }
    const open = await store.listOpen();
    return NextResponse.json(open.map(toPublicSlot));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Termine konnten nicht geladen werden." }, { status: 500 });
  }
}

/**
 * POST /api/appointments → admin creates an availability slot.
 * Validates times and rejects overlapping slots (also enforced in the store).
 */
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let body: Partial<CreateSlotInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { start_time, end_time, appointment_type, location } = body;

  if (!start_time || !end_time || !appointment_type) {
    return NextResponse.json(
      { error: "Datum, Beginn, Ende und Terminart sind erforderlich." },
      { status: 400 }
    );
  }

  const start = new Date(start_time);
  const end = new Date(end_time);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: "Ungültiges Datum oder Uhrzeit." }, { status: 400 });
  }
  if (end <= start) {
    return NextResponse.json(
      { error: "Die Endzeit muss nach der Startzeit liegen." },
      { status: 400 }
    );
  }
  if (start < new Date()) {
    return NextResponse.json(
      { error: "Der Termin darf nicht in der Vergangenheit liegen." },
      { status: 400 }
    );
  }
  if (!(APPOINTMENT_TYPES as readonly string[]).includes(appointment_type)) {
    return NextResponse.json({ error: "Unbekannte Terminart." }, { status: 400 });
  }

  try {
    const result = await getStore().create({
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      appointment_type,
      location: location?.trim() || "Wien / nach Vereinbarung",
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.data, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Termin konnte nicht angelegt werden." }, { status: 500 });
  }
}
