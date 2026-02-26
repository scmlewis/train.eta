/**
 * Central configuration constants.
 *
 * Keeping these here means a URL version bump, a poll-rate change, or a new
 * transport mode only ever requires an edit in one place.
 */

// ── Government open-data API endpoints ───────────────────────────────────────

export const API_ENDPOINTS = {
    MTR: 'https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php',
    LRT: 'https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule',
    BUS: 'https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule',
} as const;

// ── React Query polling configuration ────────────────────────────────────────

export const QUERY_CONFIG = {
    /** How often (ms) to silently re-fetch ETA data in the background. */
    REFETCH_INTERVAL: 30000,
    /** How long (ms) cached data is considered fresh before a re-fetch is triggered. */
    STALE_TIME: 15000,
} as const;

// ── Transport mode identifiers ────────────────────────────────────────────────

/** Runtime constant equivalents of the `TransportMode` union type in eta.ts. */
export const TRANSPORT_MODES = {
    MTR: 'MTR',
    LRT: 'LRT',
    BUS: 'BUS',
} as const;

/** All navigable tab IDs, including the non-transport Settings screen. */
export const TAB_IDS = {
    ...TRANSPORT_MODES,
    SETTINGS: 'SETTINGS',
} as const;
