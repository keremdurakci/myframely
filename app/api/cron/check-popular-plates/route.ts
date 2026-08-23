import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getAllStateConfigs } from "@/lib/plates/stateConfig";
import { normalizePlate } from "@/lib/plates/normalize";
import { validatePlate } from "@/lib/plates/validation";
import { getAvailabilityBatch } from "@/lib/plates/availability";
import { POPULAR_PLATE_WORDS } from "@/lib/plates/popularPlateWords";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Space between individual live checks — deliberately more conservative
// than getAvailabilityBatch's own internal pacing (none). Ohio's adapter
// has its own ~12-requests/minute limit and was observed tripping it
// mid-run even with 1.2s spacing during manual testing (2026-08-16); 1.5s
// plus the early-exit below keeps every state well under whatever its real
// limit turns out to be, without needing to know the exact number.
const DELAY_MS = 1500;
// If a state throws this many ERROR results in a row, stop checking that
// state for the rest of this run — a real state-side rate limit or outage
// won't heal by hammering it harder, and the remaining words just get
// picked up on tomorrow's run instead of burning the rest of this one.
const CONSECUTIVE_ERROR_LIMIT = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Vercel Cron hits this once a day (see vercel.json) with
// `Authorization: Bearer $CRON_SECRET`. Refreshes the popular_plates cache
// that the /popular page reads from — never live-checked on a page view.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allConfigs = await getAllStateConfigs();
  const liveConfigs = allConfigs.filter((c) => c.liveCheckEnabled);

  let checked = 0;
  const skippedStates: string[] = [];

  for (const config of liveConfigs) {
    let consecutiveErrors = 0;
    let stoppedEarly = false;

    for (const { word, category } of POPULAR_PLATE_WORDS) {
      const normalized = normalizePlate(word, config.rules);
      const validation = validatePlate(normalized, config.rules);
      if (!validation.valid) continue;

      const results = await getAvailabilityBatch(config, [normalized]);
      const result = results.get(normalized);
      checked++;

      if (result && result.status !== "ERROR") {
        consecutiveErrors = 0;
        await supabaseServer.from("popular_plates").upsert(
          {
            word: normalized,
            category,
            state_code: config.stateCode,
            status: result.status,
            checked_at: result.checkedAt,
          },
          { onConflict: "word,state_code" }
        );
      } else {
        consecutiveErrors++;
        if (consecutiveErrors >= CONSECUTIVE_ERROR_LIMIT) {
          stoppedEarly = true;
          break;
        }
      }

      await sleep(DELAY_MS);
    }

    if (stoppedEarly) skippedStates.push(config.stateCode);
  }

  return NextResponse.json({ statesProcessed: liveConfigs.length, checked, skippedStates });
}
