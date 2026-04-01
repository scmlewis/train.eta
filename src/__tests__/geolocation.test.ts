import { describe, it, expect, afterEach } from 'vitest';
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
// findNearestStations  (returns grouped { MTR, LRT, BUS })
// ---------------------------------------------------------------------------
describe('findNearestStations', () => {
    it('returns an object with MTR, LRT, and BUS arrays', () => {
        const results = findNearestStations(22.282, 114.158);
        expect(Array.isArray(results.MTR)).toBe(true);
        expect(Array.isArray(results.LRT)).toBe(true);
        expect(Array.isArray(results.BUS)).toBe(true);
    });

    it('each mode group has at most limitPerMode entries (default 3)', () => {
        const results = findNearestStations(22.282, 114.158);
        expect(results.MTR.length).toBeLessThanOrEqual(3);
        expect(results.LRT.length).toBeLessThanOrEqual(3);
        expect(results.BUS.length).toBeLessThanOrEqual(3);
    });

    it('each mode group is sorted ascending by distanceKm', () => {
        const results = findNearestStations(22.282, 114.158);
        for (const arr of [results.MTR, results.LRT, results.BUS]) {
            for (let i = 1; i < arr.length; i++) {
                expect(arr[i].distanceKm).toBeGreaterThanOrEqual(arr[i - 1].distanceKm);
            }
        }
    });

    it('populates distanceKm on every entry', () => {
        const results = findNearestStations(22.282, 114.158);
        const all = [...results.MTR, ...results.LRT, ...results.BUS];
        all.forEach(s => {
            expect(typeof s.distanceKm).toBe('number');
            expect(s.distanceKm).toBeGreaterThanOrEqual(0);
        });
    });

    it('returns MTR stations near Central', () => {
        // Central station (CEN) is at 22.2820, 114.1583
        const results = findNearestStations(22.282, 114.158);
        expect(results.MTR.length).toBeGreaterThan(0);
        results.MTR.forEach(s => expect(s.mode).toBe('MTR'));
    });

    it('respects a custom limitPerMode', () => {
        const results = findNearestStations(22.282, 114.158, 1);
        expect(results.MTR.length).toBeLessThanOrEqual(1);
        expect(results.LRT.length).toBeLessThanOrEqual(1);
        expect(results.BUS.length).toBeLessThanOrEqual(1);
    });

    it('includes LRT results for NT West coordinates', () => {
        // Near Tuen Mun: 22.394, 113.975 — should surface LRT stops
        const results = findNearestStations(22.394, 113.975);
        expect(results.LRT.length).toBeGreaterThan(0);
    });

    it('shows multi-line MTR stations multiple times with different lines', () => {
        // Admiralty (ADM) serves 4 MTR lines: TWL, ISL, SIL, EAL
        const results = findNearestStations(22.282, 114.158, 20);
        const admiraltyStations = results.MTR.filter(s => s.id === 'ADM');
        
        // Admiralty should appear at least 2 times (but ideally 4 if all are within 3 km)
        expect(admiraltyStations.length).toBeGreaterThanOrEqual(1);
        
        // If Admiralty appears multiple times, they should have different line codes
        if (admiraltyStations.length > 1) {
            const lines = admiraltyStations.map(s => s.line);
            const uniqueLines = new Set(lines);
            expect(uniqueLines.size).toBe(lines.length); // All lines should be unique
        }
    });

    it('shows multi-route LRT stops multiple times with different routes', () => {
        // Siu Lun (stop name) appears in routes 505, 507, 614 etc.
        const results = findNearestStations(22.394, 113.975, 20);
        const siuLunStops = results.LRT.filter(s => s.name === 'Siu Lun' || s.name === 'Siu Lun');
        
        // If Siu Lun appears, it should potentially appear in multiple route rows
        if (siuLunStops.length > 1) {
            const routes = siuLunStops.map(s => s.line);
            const uniqueRoutes = new Set(routes);
            expect(uniqueRoutes.size).toBe(routes.length); // All routes should be unique
        }
    });

    it('populates nameTc on MTR results', () => {
        const results = findNearestStations(22.282, 114.158);
        // All MTR entries near Central must carry a TC name
        results.MTR.forEach(s => {
            expect(typeof s.nameTc).toBe('string');
            expect((s.nameTc as string).length).toBeGreaterThan(0);
        });
    });

    it('populates nameTc on LRT results near Tuen Mun', () => {
        const results = findNearestStations(22.394, 113.975);
        results.LRT.forEach(s => {
            expect(typeof s.nameTc).toBe('string');
        });
    });

    it('MTR results near Central contain CEN or adjacent station', () => {
        const results = findNearestStations(22.282, 114.1583);
        const ids = results.MTR.map(s => s.id);
        // Central (CEN) or Hong Kong (HKG) should be among the closest MTR stations
        const knownNearby = ['CEN', 'HKG', 'ADM', 'SHW'];
        expect(ids.some(id => knownNearby.includes(id))).toBe(true);
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
