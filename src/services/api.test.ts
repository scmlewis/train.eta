import { describe, it, expect } from 'vitest';
import { normalizeBus } from './api';

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
