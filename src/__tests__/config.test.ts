/**
 * TDD tests for src/constants/config.ts
 * These are written BEFORE the module exists (Red phase).
 * They define the exact contract: values, names, shape.
 */
import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS, QUERY_CONFIG, TRANSPORT_MODES, TAB_IDS } from '../constants/config';

// ── API_ENDPOINTS ─────────────────────────────────────────────────────────────

describe('API_ENDPOINTS', () => {
    it('MTR URL matches the live government endpoint', () => {
        expect(API_ENDPOINTS.MTR).toBe(
            'https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php'
        );
    });

    it('LRT URL matches the live government endpoint', () => {
        expect(API_ENDPOINTS.LRT).toBe(
            'https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule'
        );
    });

    it('BUS URL matches the live government endpoint', () => {
        expect(API_ENDPOINTS.BUS).toBe(
            'https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule'
        );
    });

    it('all three endpoints share the same base domain', () => {
        const base = 'https://rt.data.gov.hk/v1/transport/mtr';
        expect(API_ENDPOINTS.MTR.startsWith(base)).toBe(true);
        expect(API_ENDPOINTS.LRT.startsWith(base)).toBe(true);
        expect(API_ENDPOINTS.BUS.startsWith(base)).toBe(true);
    });
});

// ── QUERY_CONFIG ─────────────────────────────────────────────────────────────

describe('QUERY_CONFIG', () => {
    it('REFETCH_INTERVAL is 30 seconds (30000 ms)', () => {
        expect(QUERY_CONFIG.REFETCH_INTERVAL).toBe(30000);
    });

    it('STALE_TIME is 15 seconds (15000 ms)', () => {
        expect(QUERY_CONFIG.STALE_TIME).toBe(15000);
    });

    it('STALE_TIME is less than REFETCH_INTERVAL (otherwise data is always fresh)', () => {
        expect(QUERY_CONFIG.STALE_TIME).toBeLessThan(QUERY_CONFIG.REFETCH_INTERVAL);
    });
});

// ── TRANSPORT_MODES ───────────────────────────────────────────────────────────

describe('TRANSPORT_MODES', () => {
    it('MTR value equals string "MTR"', () => {
        expect(TRANSPORT_MODES.MTR).toBe('MTR');
    });

    it('LRT value equals string "LRT"', () => {
        expect(TRANSPORT_MODES.LRT).toBe('LRT');
    });

    it('BUS value equals string "BUS"', () => {
        expect(TRANSPORT_MODES.BUS).toBe('BUS');
    });

    it('contains exactly 3 modes (MTR, LRT, BUS)', () => {
        expect(Object.keys(TRANSPORT_MODES)).toHaveLength(3);
    });
});

// ── TAB_IDS ───────────────────────────────────────────────────────────────────

describe('TAB_IDS', () => {
    it('contains all transport mode IDs', () => {
        expect(TAB_IDS.MTR).toBe('MTR');
        expect(TAB_IDS.LRT).toBe('LRT');
        expect(TAB_IDS.BUS).toBe('BUS');
    });

    it('contains SETTINGS tab', () => {
        expect(TAB_IDS.SETTINGS).toBe('SETTINGS');
    });

    it('does NOT contain FAV (unused dead code never shipped as a visible tab)', () => {
        expect('FAV' in TAB_IDS).toBe(false);
    });

    it('contains exactly 4 tabs', () => {
        expect(Object.keys(TAB_IDS)).toHaveLength(4);
    });
});
