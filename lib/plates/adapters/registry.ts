import type { StateConfig, StatePlateAdapter } from "../types";
import { createOfficialOnlyAdapter } from "./officialOnly.ts";
import { createWestVirginiaAdapter } from "./westVirginia.ts";
import { createKansasAdapter } from "./kansas.ts";
import { createNorthDakotaAdapter } from "./northDakota.ts";
import { createTennesseeAdapter } from "./tennessee.ts";
import { createMaineAdapter } from "./maine.ts";

// Real LIVE adapters register themselves here as they're built — keyed by
// state code. Until a state's entry exists here, AND its config has
// live_check_enabled on, it always resolves to the official-only adapter
// below, so every state works end-to-end from day one and a new live
// adapter is a pure addition, never a change to the pages/routes that call
// getAdapterForState. WV's live_check_enabled stays off in state_configs
// until it's deliberately flipped on — being registered here doesn't put
// it in front of real traffic by itself.
const LIVE_ADAPTERS: Record<string, (config: StateConfig) => StatePlateAdapter> = {
  WV: () => createWestVirginiaAdapter(),
  KS: () => createKansasAdapter(),
  ND: () => createNorthDakotaAdapter(),
  TN: () => createTennesseeAdapter(),
  ME: () => createMaineAdapter(),
};

export function getAdapterForState(config: StateConfig): StatePlateAdapter {
  const liveFactory = LIVE_ADAPTERS[config.stateCode];
  if (config.liveCheckEnabled && liveFactory) {
    return liveFactory(config);
  }
  return createOfficialOnlyAdapter(config.stateCode, config.officialCheckerUrl);
}
