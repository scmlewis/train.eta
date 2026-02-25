import { describe, it, expect } from 'vitest';
import { MTR_LINE_GROUPS, LRT_GROUPS, BUS_GROUPS } from '../constants/transportData';
import { BUS_STOP_NAMES } from '../constants/busStopNames';

describe('Tab data integrity', () => {
  it('has MTR groups and basic station entries', () => {
    expect(Array.isArray(MTR_LINE_GROUPS)).toBe(true);
    expect(MTR_LINE_GROUPS.length).toBeGreaterThan(0);
    // expect a known station id to exist in one of the groups
    const found = MTR_LINE_GROUPS.some(g => g.stations.some((s: any) => s.id === 'WHA' || s.id === 'CEN'));
    expect(found).toBe(true);
  });

  it('has LRT groups (if present) and they contain stations', () => {
    expect(Array.isArray(LRT_GROUPS)).toBe(true);
    // LRT may be empty in some builds, but should be an array
    // If populated, ensure stations are present
    if (LRT_GROUPS.length > 0) {
      expect(LRT_GROUPS[0].stations.length).toBeGreaterThan(0);
    }
  });

  it('contains BUS groups and our special variants are present', () => {
    expect(Array.isArray(BUS_GROUPS)).toBe(true);
    const names = BUS_GROUPS.map(g => typeof g.groupName === 'string' ? g.groupName : g.groupName.en);
    // check for a few expected routes including special variants
    ['506', 'K51', 'K51A', 'K52P', 'K53S', 'K75A'].forEach(r => {
      expect(names.includes(r)).toBe(true);
    });
  });
});

describe('BUS dynamic stop building logic (replicates StationPicker behavior)', () => {
  it('builds directions and endpoint labels from BUS_STOP_NAMES', () => {
    // pick a few bus groups and ensure direction info can be derived
    const sampleRoutes = BUS_GROUPS.slice(0, 8).map(g => (typeof g.groupName === 'string' ? g.groupName : g.groupName.en));

    sampleRoutes.forEach(routeKey => {
      const prefix = routeKey + '-';
      const allByDir: Record<string, Array<{ id: string; name: any }>> = {};
      for (const [id, names] of Object.entries(BUS_STOP_NAMES)) {
        if (!id.startsWith(prefix)) continue;
        const m = id.match(/-([A-Z])\d/);
        if (!m) continue;
        const dir = m[1];
        if (!allByDir[dir]) allByDir[dir] = [];
        allByDir[dir].push({ id, name: names });
      }

      // if no dynamic stops, skip (some groups are small in the test dataset)
      if (Object.keys(allByDir).length === 0) return;

      Object.values(allByDir).forEach(stops => {
        // sorted by id in StationPicker; confirm sorting produces increasing ids
        stops.sort((a, b) => String(a.id).localeCompare(String(b.id)));
        expect(stops.length).toBeGreaterThan(0);
        const firstName = (stops[0].name as any).en || '';
        const lastName = (stops[stops.length - 1].name as any).en || '';
        // endpoint label exists
        expect(lastName).toBeTruthy();

        // if not circular (first !== last) then terminal id should be defined
        if (firstName !== lastName) {
          expect(stops[stops.length - 1].id).toMatch(new RegExp(`^${routeKey}-[DU]`));
        }
      });
    });
  });
});
