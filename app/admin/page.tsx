import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabaseServer";
import { toggleLiveCheck } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

type SearchParams = Promise<{ key?: string }>;

type StateConfigRow = {
  state_code: string;
  state_name: string;
  availability_mode: string;
  live_check_enabled: boolean;
  monitoring_enabled: boolean;
  official_checker_url: string;
};

type AdapterHealthRow = {
  state_code: string;
  status: string;
  consecutive_errors: number;
  last_success_at: string | null;
  last_error_at: string | null;
};

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function fmt(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const adminSecret = process.env.ADMIN_SECRET;
  const authorized = Boolean(adminSecret) && params.key === adminSecret;

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page px-6 text-white">
        <p className="text-sm text-white/50">Unauthorized.</p>
      </main>
    );
  }

  const today = todayDate();

  const [statesRes, healthRes, availabilityRes, watchesRes, statsRes, watchChecksRes] = await Promise.all([
    supabaseServer.from("state_configs").select("*").order("state_name"),
    supabaseServer.from("adapter_health").select("*"),
    supabaseServer.from("plate_availability").select("state_code, status"),
    supabaseServer.from("plate_watches").select("status"),
    supabaseServer.from("availability_check_stats").select("*").eq("check_date", today).maybeSingle(),
    supabaseServer.from("watch_daily_checks").select("id", { count: "exact", head: true }).eq("check_date", today),
  ]);

  const states = (statesRes.data ?? []) as StateConfigRow[];
  const healthByState = new Map<string, AdapterHealthRow>(
    ((healthRes.data ?? []) as AdapterHealthRow[]).map((h) => [h.state_code, h])
  );

  const cachedByState = new Map<string, number>();
  for (const row of availabilityRes.data ?? []) {
    cachedByState.set(row.state_code, (cachedByState.get(row.state_code) ?? 0) + 1);
  }
  const totalCachedPlates = availabilityRes.data?.length ?? 0;

  const watchStatusCounts = new Map<string, number>();
  for (const row of watchesRes.data ?? []) {
    watchStatusCounts.set(row.status, (watchStatusCounts.get(row.status) ?? 0) + 1);
  }
  const activeWatches = watchStatusCounts.get("ACTIVE") ?? 0;

  const cacheHitsToday = statsRes.data?.cache_hits ?? 0;
  const freshChecksToday = statsRes.data?.fresh_checks ?? 0;
  const totalChecksToday = cacheHitsToday + freshChecksToday;
  const hitRatio = totalChecksToday > 0 ? Math.round((cacheHitsToday / totalChecksToday) * 100) : null;

  const paidChecksToday = watchChecksRes.count ?? 0;

  const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] p-5";

  return (
    <main className="min-h-screen bg-page px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold">Admin — Plate Finder</h1>
        <p className="mt-1 text-xs text-white/40">Read-only overview, Phase 1. Data as of page load.</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-white/40">Cache hits today</p>
            <p className="mt-1 text-2xl font-semibold">{cacheHitsToday}</p>
          </div>
          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-white/40">Fresh checks today</p>
            <p className="mt-1 text-2xl font-semibold">{freshChecksToday}</p>
          </div>
          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-white/40">Cache hit ratio</p>
            <p className="mt-1 text-2xl font-semibold">{hitRatio === null ? "—" : `${hitRatio}%`}</p>
          </div>
          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-white/40">Active paid watches</p>
            <p className="mt-1 text-2xl font-semibold">{activeWatches}</p>
          </div>
          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-white/40">Cached plates (total)</p>
            <p className="mt-1 text-2xl font-semibold">{totalCachedPlates}</p>
          </div>
        </div>

        <p className="mt-3 text-xs text-white/35">
          Paid daily checks completed today: {paidChecksToday} — Plate Watch ($4.99/30 days) isn&apos;t launched
          yet (Phase 3), so this and active watches will read 0 until then.
        </p>

        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-white/50">States</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-white/40">
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Live checks</th>
                <th className="px-4 py-3">Adapter health</th>
                <th className="px-4 py-3">Consecutive errors</th>
                <th className="px-4 py-3">Last success</th>
                <th className="px-4 py-3">Last error</th>
                <th className="px-4 py-3">Cached plates</th>
              </tr>
            </thead>
            <tbody>
              {states.map((state) => {
                const health = healthByState.get(state.state_code);
                const healthStatus = health?.status ?? "—";
                const healthColor =
                  healthStatus === "DEGRADED" || healthStatus === "DOWN"
                    ? "text-red-400"
                    : healthStatus === "HEALTHY"
                      ? "text-green-400"
                      : "text-white/40";
                return (
                  <tr key={state.state_code} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-medium">{state.state_name}</span>{" "}
                      <span className="text-white/40">({state.state_code})</span>
                    </td>
                    <td className="px-4 py-3 text-white/70">{state.availability_mode}</td>
                    <td className="px-4 py-3">
                      <form action={toggleLiveCheck} className="flex items-center gap-2">
                        <input type="hidden" name="key" value={params.key} />
                        <input type="hidden" name="stateCode" value={state.state_code} />
                        <input type="hidden" name="nextValue" value={(!state.live_check_enabled).toString()} />
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            state.live_check_enabled
                              ? "border-green-500/30 bg-green-500/15 text-green-400"
                              : "border-white/20 bg-white/5 text-white/50"
                          }`}
                        >
                          {state.live_check_enabled ? "ON" : "OFF"}
                        </span>
                        <button
                          type="submit"
                          className="rounded-full border border-white/20 px-2.5 py-0.5 text-xs hover:bg-white/10"
                        >
                          Turn {state.live_check_enabled ? "off" : "on"}
                        </button>
                      </form>
                    </td>
                    <td className={`px-4 py-3 font-medium ${healthColor}`}>{healthStatus}</td>
                    <td className="px-4 py-3 text-white/70">{health?.consecutive_errors ?? 0}</td>
                    <td className="px-4 py-3 text-white/50">{fmt(health?.last_success_at ?? null)}</td>
                    <td className="px-4 py-3 text-white/50">{fmt(health?.last_error_at ?? null)}</td>
                    <td className="px-4 py-3 text-white/70">{cachedByState.get(state.state_code) ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-white/35">
          Turning a state&apos;s live checks ON here makes MyFramely start sending real availability requests to
          that state&apos;s official checker for every visitor search. Only flip this after that state&apos;s
          adapter has been verified against real fixtures.
        </p>
      </div>
    </main>
  );
}
