import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { haversineDistanceKm, findNearestStations, getCurrentPosition } from '../utils/geolocation';

// ---------------------------------------------------------------------------
// haversineDistanceKm
// ---------------------------------------------------------------------------
describe('haversineDistanceKm', () => {
    it('returns 0 for identical coordinates', () => {
        expect(haversineDistanceKm(22.3, 114.1, 22.3, 114.1)).toBe(0);
    });

    it('returns a positive distance for different coordinates', () => {
        const dist = haversineDistanceKm(22.3, 114.1, 22.4, 114.2);
        expect(dist).toBeGreaterThan(0);
    });

    it('is symmetric', () => {
        const d1 = haversineDistanceKm(22.3052, 114.1897, 22.2793, 114.1650);
        const d2 = haversineDistanceKm(22.2793, 114.1650, 22.3052, 114.1897);
        expect(d1).toBeCloseTo(d2, 6);
    });

    it('calculates a known distance correctly (Whampoa → Admiralty ≈ 3.5 km)', () => {
        // Whampoa (WHA): 22.3052, 114.1897  →  Admiralty (ADM): 22.2793, 114.1650
        const dist = haversineDistanceKm(22.3052, 114.1897, 22.2793, 114.1650);
        expect(dist).toBeGreaterThan(3);
        expect(dist).toBeLessThan(5);
    });

    it('respects Earth curvature over large distances', () => {
        // Hong Kong → London (approx 9600 km)
        const dist = haversineDistanceKm(22.3, 114.2, 51.5, -0.1);
        expect(dist).toBeGreaterThan(9000);
        expect(dist).toBeLessThan(10500);
    });
});

// ---------------------------------------------------------------------------
// findNearestStations
// ---------------------------------------------------------------------------
describe('findNearestStations', () => {
    it('returns at most `limit` stations (default 3)', () => {
        // Use coordinates near Central HK where MTR stations are dense
        const results = findNearestStations(22.282, 114.158, 3);
        expect(results.length).toBeLessThanOrEqual(3);
    });

    it('returns results sorted ascending by distanceKm', () => {
        const results = findNearestStations(22.282, 114.158, 3);
        for (let i = 1; i < results.length; i++) {
            expect(results[i].distanceKm).toBeGreaterThanOrEqual(results[i - 1].distanceKm);
        }
    });

    it('populates distanceKm on each result', () => {
        const results = findNearestStations(22.282, 114.158, 3);
        results.forEach(s => {
            expect(typeof s.distanceKm).toBe('number');
            expect(s.distanceKm).toBeGreaterThanOrEqual(0);
        });
    });

    it('returns MTR stations near Central', () => {
        // Central station (CEN) is at 22.2820, 114.1583
        const results = findNearestStations(22.282, 114.158, 3);
        const modes = results.map(s => s.mode);
        expect(modes).toContain('MTR');
    });

    it('returns fewer than limit when near area with sparse coverage', () => {
        // Middle of Victoria Harbour — very few stations nearby; results ≤ 3
        const results = findNearestStations(22.285, 114.175, 3);
        expect(results.length).toBeLessThanOrEqual(3);
    });

    it('respects a custom limit', () => {
        const results = findNearestStations(22.282, 114.158, 1);
        expect(results.length).toBeLessThanOrEqual(1);
    });

    it('includes LRT results for NT West coordinates', () => {
        // Near Tuen Mun: 22.394, 113.975 — should surface LRT stops
        const results = findNearestStations(22.394, 113.975, 3);
        const hasLRT = results.some(s => s.mode === 'LRT');
        expect(hasLRT).toBe(true);
    });

    it('deduplicates — same station ID does not appear twice', () => {
        const results = findNearestStations(22.282, 114.158, 10);
        const mtrIds = results.filter(s => s.mode === 'MTR').map(s => s.id);
        const unique = new Set(mtrIds);
        expect(unique.size).toBe(mtrIds.length);
    });
});

// ---------------------------------------------------------------------------
// getCurrentPosition
// ---------------------------------------------------------------------------
describe('getCurrentPosition', () => {
    const originalGeolocation = global.navigator.geolocation;

    afterEach(() => {
        Object.defineProperty(global.navigator, 'geolocation', {
            value: originalGeolocation,
            configurable: true,
        });
    });

    it('resolves with coordinates when geolocation succeeds', async () => {
        const mockCoords = { latitude: 22.282, longitude: 114.158, accuracy: 10 };
        Object.defineProperty(global.navigator, 'geolocation', {
            value: {
                getCurrentPosition: (success: PositionCallback) =>
                    success({ coords: mockCoords } as GeolocationPosition),
            },
            configurable: true,
        });

        const coords = await getCurrentPosition();
        expect(coords.latitude).toBe(22.282);
        expect(coords.longitude).toBe(114.158);
    });

    it('rejects with a user-friendly message when permission is denied', async () => {
        Object.defineProperty(global.navigator, 'geolocation', {
            value: {
                getCurrentPosition: (_: PositionCallback, error: PositionErrorCallback) =>
                    error({
                        code: 1, // PERMISSION_DENIED
                        message: 'denied',
                        PERMISSION_DENIED: 1,
                        POSITION_UNAVAILABLE: 2,
                        TIMEOUT: 3,
                    } as GeolocationPositionError),
            },
            configurable: true,
        });

        await expect(getCurrentPosition()).rejects.toMatch(/denied/i);
    });

    it('rejects when geolocation is unavailable', async () => {
        Object.defineProperty(global.navigator, 'geolocation', {
            value: undefined,
            configurable: true,
        });

        await expect(getCurrentPosition()).rejects.toMatch(/not supported/i);
    });
});
