import { supabaseServer } from "@/lib/supabaseServer";
import type { AvailabilityMode, StateConfig, StateRules } from "./types";

type StateConfigRow = {
  state_code: string;
  state_name: string;
  availability_mode: AvailabilityMode;
  live_check_enabled: boolean;
  monitoring_enabled: boolean;
  official_checker_url: string;
  cache_ttl_minutes: number;
  rules_json: StateRules;
};

function rowToConfig(row: StateConfigRow): StateConfig {
  return {
    stateCode: row.state_code,
    stateName: row.state_name,
    availabilityMode: row.availability_mode,
    liveCheckEnabled: row.live_check_enabled,
    monitoringEnabled: row.monitoring_enabled,
    officialCheckerUrl: row.official_checker_url,
    cacheTtlMinutes: row.cache_ttl_minutes,
    rules: row.rules_json,
  };
}

// No fallback config is fabricated for an unseeded state — we don't have a
// verified official checker URL for it, and pointing someone at a guessed
// link is worse than saying we don't support it yet.
export async function getStateConfig(stateCode: string): Promise<StateConfig | null> {
  const { data } = await supabaseServer
    .from("state_configs")
    .select("*")
    .eq("state_code", stateCode.toUpperCase())
    .maybeSingle();
  if (!data) return null;
  return rowToConfig(data as StateConfigRow);
}

export async function getAllStateConfigs(): Promise<StateConfig[]> {
  const { data } = await supabaseServer.from("state_configs").select("*").order("state_name");
  return (data ?? []).map((r) => rowToConfig(r as StateConfigRow));
}
