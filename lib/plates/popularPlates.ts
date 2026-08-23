import { supabaseServer } from "../supabaseServer";

export type PopularPlateEntry = { word: string; category: string; checkedAt: string };

// Reads the cache app/api/cron/check-popular-plates keeps fresh — never
// live-checks a state on a page view.
export async function getAvailablePopularPlates(stateCode: string): Promise<PopularPlateEntry[]> {
  const { data } = await supabaseServer
    .from("popular_plates")
    .select("word, category, checked_at")
    .eq("state_code", stateCode)
    .eq("status", "AVAILABLE")
    .order("word");

  return (data ?? []).map((row) => ({
    word: row.word as string,
    category: row.category as string,
    checkedAt: row.checked_at as string,
  }));
}
