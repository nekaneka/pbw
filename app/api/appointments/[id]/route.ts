import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { isAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** DELETE /api/appointments/:id → admin only: deletes a slot. */
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
