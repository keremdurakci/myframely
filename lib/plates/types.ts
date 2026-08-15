export type AvailabilityMode = "LIVE" | "PENDING" | "OFFICIAL_ONLY" | "DISABLED";

export type StateRules = {
  minCharacters: number;
  maxCharacters: number;
  supportsSpaces: boolean;
  supportsHyphens: boolean;
  // Character class body, e.g. "A-Z0-9" — used inside a `[...]` regex.
  allowedCharacters: string;
  // Regex strings checked (case-insensitively) against the normalized plate;
  // a match rejects the candidate.
  forbiddenPatterns?: string[];
};

export type StateConfig = {
  stateCode: string;
  stateName: string;
  availabilityMode: AvailabilityMode;
  liveCheckEnabled: boolean;
  monitoringEnabled: boolean;
  officialCheckerUrl: string;
  cacheTtlMinutes: number;
  rules: StateRules;
};

export type AvailabilityStatus = "AVAILABLE" | "TAKEN" | "UNKNOWN" | "ERROR";

export type AvailabilityResult = {
  status: AvailabilityStatus;
  checkedAt: string;
  source: "live" | "cache" | "manual";
  adapterVersion?: string;
};

// One adapter per LIVE state. Implementations must never bypass a CAPTCHA,
// login wall, or access-control block — checkAvailability() should return
// status "ERROR" (and let the caller trip the circuit breaker) the moment it
// detects any of those instead of trying to work around them.
export type StatePlateAdapter = {
  stateCode: string;
  adapterVersion: string;
  validatePlate: (plate: string, rules: StateRules) => { valid: true } | { valid: false; reason: string };
  normalizePlate: (plate: string, rules: StateRules) => string;
  checkAvailability: (normalizedPlate: string) => Promise<AvailabilityResult>;
  getOfficialUrl: () => string;
};
