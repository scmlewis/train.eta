import type { StationOption } from '../constants/transportData';
import { API_ENDPOINTS } from '../constants/config';

function normalizeStopId(id?: string) {
    return String(id || '').replace(/-n(?=[A-Z0-9])/i, '-').toUpperCase();
}

function parseStopId(id?: string) {
    const m = String(id || '').match(/-(?:n)?([A-Z])(\d+)/i);
    if (!m) return { dir: null as null | string, seq: null as null | number };
    return { dir: m[1].toUpperCase(), seq: parseInt(m[2], 10) };
}

export type DirectionStops = {
    dir: string | null;
    stops: Array<{ id: string; seq: number | null; raw: any }>;
};

export async function fetchRouteStops(routeName: string, lang: 'EN' | 'TC' = 'EN') {
    const params = { language: lang === 'TC' ? 'zh' : 'en', routeName };
    const res = await fetch(API_ENDPOINTS.BUS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to fetch route stops');
    const raw = await res.text();
    const data = JSON.parse(raw.replace(/^\uFEFF/, ''));

    const busStops = Array.isArray(data.busStop) ? data.busStop : [];

    const byDir: Record<string, DirectionStops> = {};

    for (const s of busStops) {
        const id = normalizeStopId(s.busStopId);
        const { dir, seq } = parseStopId(s.busStopId);
        const key = dir || 'UNKNOWN';
        if (!byDir[key]) byDir[key] = { dir: key, stops: [] };
        byDir[key].stops.push({ id, seq, raw: s });
    }

    // Sort by sequence where available
    Object.values(byDir).forEach(d => d.stops.sort((a, b) => {
        if (a.seq == null && b.seq == null) return 0;
        if (a.seq == null) return 1;
        if (b.seq == null) return -1;
        return a.seq - b.seq;
    }));

    if (typeof window !== 'undefined') {
        console.log(`[busStops] ${routeName} - Grouped into directions:`, Object.keys(byDir));
    }

    return {
        routeName: data.routeName || routeName,
        byDir
    };
}

export function toStationOptions(stops: Array<{ id: string; seq: number | null; raw: any }>, nameLookup?: (id: string) => string | undefined): StationOption[] {
    return stops.map((s, i) => ({
        id: s.id,
        name: nameLookup ? (nameLookup(s.id) || `Stop ${i + 1}`) : `Stop ${i + 1}`
    } as StationOption));
}

export { normalizeStopId, parseStopId };
