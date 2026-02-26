/**
 * Station Coverage Tests
 *
 * Validates that every station/stop entry in the transport data:
 *   1. MTR: all station IDs map to a known entry in MTR_STATIONS dictionary
 *   2. LRT: all station IDs are non-empty strings (numeric IDs used by the API)
 *   3. Bus: all stop IDs have a matching entry in BUS_STOP_NAMES (i.e., name data exists)
 *   4. api.ts normalizers: offline/delay flags work correctly with mocked API responses
 */

import { describe, it, expect } from 'vitest';
import { MTR_LINE_GROUPS, LRT_GROUPS, BUS_GROUPS } from '../constants/transportData';
import { MTR_STATIONS, MTR_LINE_COLORS } from '../constants/mtrData';
import { BUS_STOP_NAMES } from '../constants/busStopNames';
import { normalizeMTR, normalizeLRT } from '../services/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** All {line, id} pairs defined in MTR_LINE_GROUPS */
const allMtrStations = (): Array<{ line: string; id: string; groupName: string }> =>
    MTR_LINE_GROUPS.flatMap(g =>
        g.stations.map(s => ({
            line: (s as any).line ?? '',
            id: s.id,
            groupName: typeof g.groupName === 'string' ? g.groupName : g.groupName.en
        }))
    );

/** All {route, id} pairs in BUS_GROUPS */
const allBusStops = (): Array<{ route: string; id: string }> =>
    BUS_GROUPS.flatMap(g =>
        g.stations.map(s => ({
            route: typeof g.groupName === 'string' ? g.groupName : (g.groupName as any).en,
            id: s.id
        }))
    );

// ─── MTR Station Validation ──────────────────────────────────────────────────

describe('MTR station coverage', () => {
    const stations = allMtrStations();

    it('has at least one station group', () => {
        expect(MTR_LINE_GROUPS.length).toBeGreaterThan(0);
    });

    it('each station ID exists in MTR_STATIONS dictionary', () => {
        const missing: string[] = [];
        for (const { id, groupName } of stations) {
            if (!MTR_STATIONS[id]) missing.push(`${groupName}: ${id}`);
        }
        if (missing.length > 0) {
            throw new Error(
                `${missing.length} MTR station IDs not found in MTR_STATIONS:\n` +
                missing.map(m => `  - ${m}`).join('\n')
            );
        }
        expect(missing).toHaveLength(0);
    });

    it('every group has a line colour', () => {
        const missing: string[] = [];
        for (const g of MTR_LINE_GROUPS) {
            // Each station carries its own line code
            const lines = [...new Set(g.stations.map(s => (s as any).line).filter(Boolean))];
            for (const line of lines) {
                if (!MTR_LINE_COLORS[line]) missing.push(`${line}`);
            }
        }
        if (missing.length > 0) {
            throw new Error(
                `No colour defined for MTR lines: ${missing.join(', ')}`
            );
        }
        expect(missing).toHaveLength(0);
    });

    it('Prince Edward is present on both KTL and TWL groups', () => {
        const ktlGroup = MTR_LINE_GROUPS.find(g =>
            (typeof g.groupName === 'object' ? g.groupName.en : g.groupName) === 'Kwun Tong Line'
        );
        const twlGroup = MTR_LINE_GROUPS.find(g =>
            (typeof g.groupName === 'object' ? g.groupName.en : g.groupName) === 'Tsuen Wan Line'
        );
        expect(ktlGroup?.stations.some(s => s.id === 'PRE')).toBe(true);
        expect(twlGroup?.stations.some(s => s.id === 'PRE')).toBe(true);
    });

    it('Sai Wan Ho is present on ISL group', () => {
        const islGroup = MTR_LINE_GROUPS.find(g =>
            (typeof g.groupName === 'object' ? g.groupName.en : g.groupName) === 'Island Line'
        );
        expect(islGroup?.stations.some(s => s.id === 'SWH')).toBe(true);
    });

    it('East Rail Line has MKK (Mong Kok East) not MOK (Mong Kok)', () => {
        const ealGroup = MTR_LINE_GROUPS.find(g =>
            (typeof g.groupName === 'object' ? g.groupName.en : g.groupName) === 'East Rail Line'
        );
        expect(ealGroup).toBeDefined();
        expect(ealGroup!.stations.some(s => s.id === 'MKK')).toBe(true);
        expect(ealGroup!.stations.some(s => s.id === 'MOK')).toBe(false);
    });
});

// ─── LRT Station Validation ──────────────────────────────────────────────────

describe('LRT station coverage', () => {
    it('has at least one LRT route group', () => {
        expect(LRT_GROUPS.length).toBeGreaterThan(0);
    });

    it('all LRT station IDs are non-empty strings', () => {
        for (const g of LRT_GROUPS) {
            for (const s of g.stations) {
                const id = String(s.id);
                expect(id.trim().length, `Empty station ID in route ${typeof g.groupName === 'string' ? g.groupName : (g.groupName as any).en}`).toBeGreaterThan(0);
            }
        }
    });

    it('Butterfly station ID is 20 (corrected from wrong 25)', () => {
        // Butterfly appears in routes 610, 615, 615P
        const routesWithButterfly = ['610', '615', '615P'];
        for (const routeName of routesWithButterfly) {
            const group = LRT_GROUPS.find(g => g.groupName === routeName);
            if (!group) continue; // skip if route doesn't exist in this build
            const butterfly = group.stations.find(s =>
                typeof s.name === 'object' && (s.name as any).en === 'Butterfly'
            );
            if (butterfly) {
                expect(
                    String(butterfly.id),
                    `Route ${routeName}: Butterfly must have ID '20', not '25'`
                ).toBe('20');
            }
        }
    });

    it('Light Rail Depot station ID is 30 (corrected from wrong 35)', () => {
        const routesWithDepot = ['610', '615', '615P'];
        for (const routeName of routesWithDepot) {
            const group = LRT_GROUPS.find(g => g.groupName === routeName);
            if (!group) continue;
            const depot = group.stations.find(s =>
                typeof s.name === 'object' && (s.name as any).en === 'Light Rail Depot'
            );
            if (depot) {
                expect(
                    String(depot.id),
                    `Route ${routeName}: Light Rail Depot must have ID '30', not '35'`
                ).toBe('30');
            }
        }
    });

    it('no duplicate LRT routes exist', () => {
        const names = LRT_GROUPS.map(g => String(g.groupName));
        const unique = new Set(names);
        expect(unique.size).toBe(names.length);
    });
});

// ─── Bus Stop Validation ─────────────────────────────────────────────────────

describe('Bus stop coverage', () => {
    it('has at least one bus route group', () => {
        expect(BUS_GROUPS.length).toBeGreaterThan(0);
    });

    it('every bus stop ID listed in BUS_GROUPS exists in BUS_STOP_NAMES', () => {
        const missing: string[] = [];
        for (const { route, id } of allBusStops()) {
            if (!BUS_STOP_NAMES[id]) missing.push(`${route}: ${id}`);
        }
        if (missing.length > 0) {
            throw new Error(
                `${missing.length} bus stop IDs not found in BUS_STOP_NAMES:\n` +
                missing.map(m => `  - ${m}`).join('\n')
            );
        }
        expect(missing).toHaveLength(0);
    });

    it('K58 first stop is K58-D001 (corrected from K58-D010)', () => {
        const k58 = BUS_GROUPS.find(g => g.groupName === 'K58');
        expect(k58).toBeDefined();
        expect(k58!.stations[0].id).toBe('K58-D001');
    });

    it('K58 last stop exists in BUS_STOP_NAMES', () => {
        const k58 = BUS_GROUPS.find(g => g.groupName === 'K58');
        expect(k58).toBeDefined();
        const lastId = k58!.stations[k58!.stations.length - 1].id;
        expect(BUS_STOP_NAMES[lastId]).toBeDefined();
    });

    it('BUS_STOP_NAMES has name data for all 506 stops', () => {
        const route506Ids = Object.keys(BUS_STOP_NAMES).filter(k => k.startsWith('506-'));
        expect(route506Ids.length).toBeGreaterThan(0);
        for (const id of route506Ids) {
            const name = BUS_STOP_NAMES[id] as any;
            const hasName = typeof name === 'string'
                ? name.trim().length > 0
                : (name?.en?.trim().length > 0 || name?.tc?.trim().length > 0);
            expect(hasName, `506 stop ${id} has no name`).toBe(true);
        }
    });

    it('no duplicate stop IDs within the same bus route', () => {
        for (const g of BUS_GROUPS) {
            const ids = g.stations.map(s => s.id);
            const unique = new Set(ids);
            const route = typeof g.groupName === 'string' ? g.groupName : (g.groupName as any).en;
            expect(unique.size, `Duplicate stop IDs in route ${route}`).toBe(ids.length);
        }
    });
});

// ─── API normalizer unit tests ────────────────────────────────────────────────

describe('normalizeMTR API normalizer', () => {
    // Note: normalizeMTR(data, stationCode, lineCode) — station first, then line
    // Internally it builds the lookup key as `${lineCode}-${stationCode}`

    it('returns offline:true when status is 0', () => {
        const fakeData = { status: 0, message: 'Service not available' };
        // station='PRE', line='KTL' → looks up 'KTL-PRE'
        const result = normalizeMTR(fakeData as any, 'PRE', 'KTL');
        expect(result.offline).toBe(true);
        expect(result.up).toHaveLength(0);
        expect(result.down).toHaveLength(0);
    });

    it('returns delayed:true when isdelay is Y', () => {
        const fakeData = {
            status: 1,
            isdelay: 'Y',
            data: {
                'KTL-PRE': {
                    UP: [],
                    DOWN: []
                }
            }
        };
        // station='PRE', line='KTL' → finds 'KTL-PRE'
        const result = normalizeMTR(fakeData as any, 'PRE', 'KTL');
        expect(result.delayed).toBe(true);
        expect(result.offline).toBeFalsy();
    });

    it('returns empty up/down arrays (no offline) for normal response with no trains', () => {
        const fakeData = {
            status: 1,
            isdelay: 'N',
            data: {
                'KTL-PRE': {
                    UP: [],
                    DOWN: []
                }
            }
        };
        const result = normalizeMTR(fakeData as any, 'PRE', 'KTL');
        expect(result.offline).toBeFalsy();
        expect(result.delayed).toBeFalsy();
        expect(Array.isArray(result.up)).toBe(true);
        expect(Array.isArray(result.down)).toBe(true);
    });

    it('parses train arrival times correctly', () => {
        const fakeData = {
            status: 1,
            isdelay: 'N',
            data: {
                'ISL-SWH': {
                    // Do NOT require valid:'Y' — normalizeMTR must show trains regardless of valid field
                    UP: [{ time: '2025-01-01 08:30:00', dest: 'KET', plat: '1', seq: '1', ttnt: '3' }],
                    DOWN: [{ time: '2025-01-01 08:32:00', dest: 'CHW', plat: '2', seq: '1', ttnt: '5' }]
                }
            }
        };
        // station='SWH', line='ISL' → finds 'ISL-SWH'
        const result = normalizeMTR(fakeData as any, 'SWH', 'ISL');
        expect(result.up.length).toBe(1);
        expect(result.down.length).toBe(1);
        expect(result.up[0].destination).toBeTruthy();
        expect(result.up[0].time).toBeTruthy();
    });
});

describe('normalizeLRT API normalizer', () => {
    it('returns empty array when platform_list is empty', () => {
        const fakeData = { status: 1, platform_list: [] };
        const result = normalizeLRT(fakeData as any);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
    });

    it('returns empty array when platform_list is missing (status 0 / no data)', () => {
        const fakeData = { status: 0, platform_list: [] };
        const result = normalizeLRT(fakeData as any);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
    });

    it('parses ETAs from platform_list correctly', () => {
        const fakeData = {
            status: 1,
            platform_list: [
                {
                    platform_id: 1,
                    route_list: [
                        {
                            route_no: '610',
                            dest_ch: '元朗',
                            dest_en: 'Yuen Long',
                            train_length: 1,
                            light_rail_inter_id: 0,
                            arr_time: '3',
                            time_ch: '3 分鐘',
                            time_en: '3 min'
                        }
                    ]
                }
            ]
        };
        // normalizeLRT returns { platform: string, etas: ETA[] }[]
        const result = normalizeLRT(fakeData as any);
        expect(result.length).toBeGreaterThan(0);
        const platformEntry = result[0];
        expect(platformEntry.platform).toBe('1');
        expect(platformEntry.etas.length).toBeGreaterThan(0);
        const eta = platformEntry.etas[0];
        expect((eta as any).routeNo).toBe('610');
        expect(eta.destination).toBeTruthy();
    });
});
