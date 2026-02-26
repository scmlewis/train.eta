import { describe, it, expect, vi, afterEach } from 'vitest';
import { normalizeBus, extractBusRoute, normalizeMTR, fetchBus, fetchMTR } from './api';
import { API_ENDPOINTS } from '../constants/config';

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── extractBusRoute ───────────────────────────────────────────────────────────

describe('extractBusRoute', () => {
    it('extracts route from a standard stop ID (K65-D010 → K65)', () => {
        expect(extractBusRoute('K65-D010')).toBe('K65');
    });

    it('extracts route from a stop ID with letter suffix in route name (K51A-D010 → K51A)', () => {
        expect(extractBusRoute('K51A-D010')).toBe('K51A');
    });

    it('extracts route from a numeric-prefix stop ID (506-D010 → 506)', () => {
        expect(extractBusRoute('506-D010')).toBe('506');
    });

    it('extracts route from K58 first stop (K58-D001 → K58)', () => {
        expect(extractBusRoute('K58-D001')).toBe('K58');
    });

    it('prefers the lineProp arg over parsing the stationId', () => {
        expect(extractBusRoute('K65-D010', 'K65')).toBe('K65');
    });

    it('returns full stationId unchanged when there is no dash', () => {
        expect(extractBusRoute('K58')).toBe('K58');
    });

    it('handles U-direction stop IDs (K75A-U030 → K75A)', () => {
        expect(extractBusRoute('K75A-U030')).toBe('K75A');
    });
});

describe('normalizeBus', () => {
  it('returns empty array when data missing', () => {
    expect(normalizeBus(null as any)).toEqual([]);
    expect(normalizeBus({} as any)).toEqual([]);
  });

  it('parses bus stop entries and prefers destEn/destCh over routeName', () => {
    const sample = {
      routeName: 'Route 999',
      busStop: [
        {
          busStopId: 'STOP1',
          bus: [
            { departureTimeInSecond: '60', destEn: 'Central', destCh: '中環', busId: 'B1', departureTimeText: '1 minutes', isScheduled: '0' },
            { departureTimeInSecond: '120', destEn: '', destCh: '', busId: 'B2', departureTimeText: '2 minutes', isScheduled: '1' }
          ]
        },
        {
          busStopId: 'STOP2',
          bus: [
            { departureTimeInSecond: '30', destEn: undefined, destCh: undefined, busId: 'B3', departureTimeText: 'less than a minute', isScheduled: '0' }
          ]
        }
      ]
    };

    const out = normalizeBus(sample, 'EN');
    expect(Array.isArray(out)).toBe(true);
    // should include stopId mapping and destination fallback
    const stop1 = out.find((e: any) => e.stopId === 'STOP1');
    expect(stop1).toBeDefined();
    if (stop1) expect(stop1.destination).toBe('Central');

    const stop2 = out.find((e: any) => e.stopId === 'STOP2');
    expect(stop2).toBeDefined();
    // fallback to routeName when destEn missing
    if (stop2) expect(stop2.destination).toBe('Route 999');
  });
});

describe('normalizeBus additional cases', () => {
  it('formats tti and isScheduled correctly and generates ids', () => {
    const sample = {
      routeName: 'Route 123',
      busStop: [
        {
          busStopId: 'S1',
          bus: [
            { departureTimeInSecond: '90', destEn: 'North', destCh: '北', busId: 'BX', departureTimeText: '1 minutes', isScheduled: '0' },
            { departureTimeInSecond: '0', destEn: '', destCh: '', busId: 'BY', departureTimeText: '0 分鐘', isScheduled: '1' }
          ]
        }
      ]
    };

    const out = normalizeBus(sample, 'EN');
    expect(out.length).toBe(2);
    const [first, second] = out;
    // id includes stopId and busId
    expect(first.id).toMatch(/^bus-S1-BX/);
    expect(first.tti).toContain('min');
    expect(typeof first.isScheduled).toBe('boolean');
    expect(first.isScheduled).toBe(false);

    // second entry fallback destination to routeName when destEn empty
    expect(second.destination).toBe('Route 123');
    expect(second.isScheduled).toBe(true);
  });

  it('returns empty array for null/undefined/empty data', () => {
    expect(normalizeBus(null as any)).toEqual([]);
    expect(normalizeBus(undefined as any)).toEqual([]);
    expect(normalizeBus({} as any)).toEqual([]);
  });
});

// ── normalizeMTR valid-field behaviour ───────────────────────────────────────

describe('normalizeMTR valid field handling', () => {
  it('includes trains regardless of valid field value (shows valid:N and missing valid)', () => {
    const fakeData = {
      status: 1,
      isdelay: 'N',
      data: {
        'KTL-PRE': {
          UP: [
            { time: '08:30:00', dest: 'WHA', plat: '1', seq: '1', ttnt: '2', valid: 'N' },
            { time: '08:33:00', dest: 'WHA', plat: '1', seq: '2', ttnt: '5', valid: 'Y' },
            { time: '08:36:00', dest: 'TIK', plat: '2', seq: '3', ttnt: '8' /* no valid field */ }
          ],
          DOWN: []
        }
      }
    };
    const result = normalizeMTR(fakeData, 'PRE', 'KTL');
    // All 3 trains should be present — none filtered by valid field
    expect(result.up.length).toBe(3);
    expect(result.down.length).toBe(0);
    expect(result.offline).toBeFalsy();
  });

  it('marks status=0 as offline even when message says contents are empty', () => {
    const fakeData = {
      status: 0,
      message: 'The contents are empty!'
    };

    const result = normalizeMTR(fakeData, 'SWH', 'ISL');
    expect(result.offline).toBe(true);
    expect(result.up).toHaveLength(0);
    expect(result.down).toHaveLength(0);
  });
});

describe('fetchBus API contract', () => {
  it('uses POST JSON to base endpoint (no query string)', async () => {
    const payload = {
      routeName: 'K58',
      busStop: []
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    vi.stubGlobal('fetch', fetchMock as any);

    await fetchBus('K58', 'EN');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(API_ENDPOINTS.BUS);
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.body).toBe(JSON.stringify({ language: 'en', routeName: 'K58' }));
  });
});

describe('fetchMTR legacy station aliases', () => {
  it('maps PEK to PRE when calling API', async () => {
    const payload = {
      status: 1,
      isdelay: 'N',
      data: {
        'KTL-PRE': { UP: [], DOWN: [] }
      }
    };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    vi.stubGlobal('fetch', fetchMock as any);

    await fetchMTR('KTL', 'PEK');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('line=KTL');
    expect(String(url)).toContain('sta=PRE');
  });
});
