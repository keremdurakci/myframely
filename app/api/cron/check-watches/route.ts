import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getStateConfig } from "@/lib/plates/stateConfig";
import { getAvailabilityBatch } from "@/lib/plates/availability";
import { sendPlateAvailableEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

type WatchRow = {
  id: string;
  customer_email: string;
  state_code: string;
  normalized_plate: string;
};

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// Vercel Cron hits this once a day (see vercel.json) with
// `Authorization: Bearer $CRON_SECRET` attached automatically. Everything
// here is orchestration only — the actual adapter calls, caching, and
// circuit breaker are all handled by getAvailabilityBatch, the same entry
// point the results page uses.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();

  const { data: expiredWatches } = await supabaseServer
    .from("plate_watches")
    .update({ status: "EXPIRED" })
    .eq("status", "ACTIVE")
    .lt("expires_at", now)
    .select("id");

  const { data: dueWatches } = await supabaseServer
    .from("plate_watches")
    .select("id, customer_email, state_code, normalized_plate")
    .eq("status", "ACTIVE")
    .lte("next_check_at", now);

  const watches = (dueWatches ?? []) as WatchRow[];
  const watchesByState = new Map<string, WatchRow[]>();
  for (const watch of watches) {
    const list = watchesByState.get(watch.state_code) ?? [];
    list.push(watch);
    watchesByState.set(watch.state_code, list);
  }

  const today = todayDate();
  let alertsSent = 0;

  for (const [stateCode, stateWatches] of watchesByState) {
    const config = await getStateConfig(stateCode);
    if (!config) continue;

    const uniquePlates = [...new Set(stateWatches.map((w) => w.normalized_plate))];
    const resultsByPlate = await getAvailabilityBatch(config, uniquePlates);

    for (const watch of stateWatches) {
      const result = resultsByPlate.get(watch.normalized_plate);
      if (!result) continue;

      await supabaseServer.from("watch_daily_checks").upsert(
        {
          watch_id: watch.id,
          state_code: watch.state_code,
          normalized_plate: watch.normalized_plate,
          check_date: today,
          availability_result: result.status,
          checked_at: result.checkedAt,
        },
        { onConflict: "watch_id,check_date" }
      );

      if (result.status === "AVAILABLE") {
        // Guarded by status='ACTIVE' so a cron re-run can't double-fire the
        // alert email for a watch already flipped to FOUND_AVAILABLE.
        const { data: updated } = await supabaseServer
          .from("plate_watches")
          .update({ status: "FOUND_AVAILABLE", alert_sent_at: new Date().toISOString() })
          .eq("id", watch.id)
          .eq("status", "ACTIVE")
          .select("id");

        if (updated && updated.length > 0) {
          const sent = await sendPlateAvailableEmail({
            to: watch.customer_email,
            plate: watch.normalized_plate,
            stateName: config.stateName,
          });
          if (sent) alertsSent++;
        }
      } else {
        const nextCheckAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await supabaseServer
          .from("plate_watches")
          .update({ last_checked_at: new Date().toISOString(), next_check_at: nextCheckAt })
          .eq("id", watch.id);
      }
    }
  }

  return NextResponse.json({
    expired: expiredWatches?.length ?? 0,
    checked: watches.length,
    statesProcessed: watchesByState.size,
    alertsSent,
  });
}
