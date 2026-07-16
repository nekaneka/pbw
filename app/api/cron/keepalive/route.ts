import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/keepalive → runs one minimal database query.
 *
 * Called daily by Vercel Cron (see vercel.json). Purpose: Supabase pauses
 * free-tier projects after 7 days without any API request – a single daily
 * read keeps the project active indefinitely, no Pro plan needed.
 *
 * When CRON_SECRET is set in the environment, Vercel Cron automatically
 * sends it as "Authorization: Bearer <secret>" and other callers are
 * rejected. Without the env var the endpoint is open, which is harmless –
 * it reveals nothing beyond what the public slot list already exposes.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const open = await getStore().listOpen();
    return NextResponse.json({
      ok: true,
      openSlots: open.length,
      at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("keepalive failed:", err);
    return NextResponse.json({ error: "keepalive failed" }, { status: 500 });
  }
}
