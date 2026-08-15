import { NextRequest, NextResponse } from "next/server";
import { getStateConfig } from "@/lib/plates/stateConfig";
import { generateSuggestions, type SuggestionStyle } from "@/lib/plates/suggestionEngine";
import { getAvailabilityBatch } from "@/lib/plates/availability";

const VALID_STYLES: SuggestionStyle[] = [
  "clean",
  "funny",
  "minimal",
  "luxury",
  "car",
  "business",
  "creative",
];

// Read-only, no DMV call, no auth — pure local computation from the
// suggestion engine. Kept as its own endpoint (separate from the
// server-rendered results page) so client-side interactions like a style
// filter can re-generate suggestions without a full page navigation.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stateCode = (searchParams.get("state") ?? "").toUpperCase();
  const word = searchParams.get("word") ?? "";
  const styleParam = searchParams.get("style");
  const number = searchParams.get("number") || undefined;

  if (!stateCode || !word.trim()) {
    return NextResponse.json({ error: "state and word are required" }, { status: 400 });
  }

  const config = await getStateConfig(stateCode);
  if (!config) {
    return NextResponse.json({ error: "This state isn't supported yet" }, { status: 404 });
  }

  const style = VALID_STYLES.includes(styleParam as SuggestionStyle)
    ? (styleParam as SuggestionStyle)
    : undefined;

  const suggestions = generateSuggestions({ word, style, number, rules: config.rules });
  const availabilityByPlate = await getAvailabilityBatch(config, suggestions.map((s) => s.plate));
  const results = suggestions.map((s) => ({
    ...s,
    availability: availabilityByPlate.get(s.plate)!,
  }));

  return NextResponse.json({
    state: {
      code: config.stateCode,
      name: config.stateName,
      availabilityMode: config.availabilityMode,
      liveCheckEnabled: config.liveCheckEnabled,
      officialCheckerUrl: config.officialCheckerUrl,
    },
    suggestions: results,
  });
}
