import { NextRequest, NextResponse } from "next/server";
import { getStateConfig } from "@/lib/plates/stateConfig";
import { normalizePlate } from "@/lib/plates/normalize";
import { findNearbyAvailablePlates } from "@/lib/plates/availability";

const WANTED = 5;
const MAX_EXCLUDE = 200;

// Backs the "Generate More" button on the results page — the initial batch
// of nearby alternatives is server-rendered with the page, this is only
// for asking for another batch without a full page reload. Client sends
// back every plate already tried (shown or not) so the search continues
// outward instead of repeating itself.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const stateCode = typeof body?.stateCode === "string" ? body.stateCode.toUpperCase() : "";
  const plate = typeof body?.plate === "string" ? body.plate : "";
  const exclude = Array.isArray(body?.exclude) ? body.exclude.filter((v: unknown) => typeof v === "string") : [];

  if (!stateCode || !plate) {
    return NextResponse.json({ error: "stateCode and plate are required" }, { status: 400 });
  }
  if (exclude.length > MAX_EXCLUDE) {
    return NextResponse.json({ error: "Too many excluded plates" }, { status: 400 });
  }

  const config = await getStateConfig(stateCode);
  if (!config || !config.liveCheckEnabled) {
    return NextResponse.json({ error: "Live availability isn't available for this state" }, { status: 400 });
  }

  const normalizedPlate = normalizePlate(plate, config.rules);
  const { matches, tried } = await findNearbyAvailablePlates(config, normalizedPlate, new Set(exclude), WANTED);

  return NextResponse.json({
    matches: matches.map((m) => ({ plate: m.plate, status: m.availability.status })),
    tried,
  });
}
