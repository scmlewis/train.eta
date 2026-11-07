// @vitest-environment node
/**
 * Live MTR API health check (opt-in).
 *
 * This test talks to the real government endpoint, so it is skipped during a
 * normal `npm test` run. Run it explicitly with:
 *
 *   npm run check:mtr-api
 *
 * It walks every MTR line/station pair configured in transportData.ts and
 * verifies that the API returns a well-formed schedule response. Per-line
 * totals are printed so an outage or a stale station code is easy to spot.
 *
 * The provider uses `status: 0` plus "The contents are empty!" both outside
 * operating hours and for individual stations with no remaining trains, so an
 * empty response is reported as a warning rather than a failure.
 */

import { describe, it, expect } from 'vitest';
import { MTR_LINE_GROUPS } from '../constants/transportData';
import { API_ENDPOINTS } from '../constants/config';

const isLiveMode = import.meta.env.MODE === 'live';
const REQUEST_TIMEOUT = 15_000;
const MAX_CONCURRENCY = 4;
const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

interface StationPair {
    line: string;
    station: string;
    group: string;
}

interface CheckResult extends StationPair {
    kind: 'ok' | 'empty' | 'hard';
    http?: number;
    providerStatus?: number;
    message?: string;
    up: number;
    down: number;
    detail?: string;
}

interface RawStationSchedule {
    UP?: unknown;
    DOWN?: unknown;
}

interface RawMtrResponse {
    status?: number;
    message?: string;
    data?: Record<string, RawStationSchedule>;
}

function configuredPairs(): StationPair[] {
    const seen = new Set<string>();
    const pairs: StationPair[] = [];

    for (const group of MTR_LINE_GROUPS) {
        const groupName = typeof group.groupName === 'string'
            ? group.groupName
            : group.groupName.en;
        for (const station of group.stations) {
            if (!station.line) continue;
            const key = `${station.line}-${station.id}`;
            if (seen.has(key)) continue;
            seen.add(key);
            pairs.push({ line: station.line, station: station.id, group: groupName });
        }
    }

    return pairs;
}

async function checkPair({ line, station, group }: StationPair): Promise<CheckResult> {
    const base: CheckResult = { line, station, group, kind: 'hard', up: 0, down: 0 };
    const url = `${API_ENDPOINTS.MTR}?line=${encodeURIComponent(line)}&sta=${encodeURIComponent(station)}`;

    try {
        let response: Response | undefined;

        // The public endpoint rate-limits bursts (HTTP 429), so retry with backoff.
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
            try {
                response = await fetch(url, { signal: controller.signal });
            } finally {
                clearTimeout(timer);
            }

            if (response.status !== 429 || attempt === MAX_RETRIES) break;
            await sleep(1_000 * 2 ** attempt);
        }

        if (!response) {
            return { ...base, detail: 'No response' };
        }

        base.http = response.status;
        if (!response.ok) {
            return { ...base, detail: `HTTP ${response.status}` };
        }

        let data: RawMtrResponse;
        try {
            data = (await response.json()) as RawMtrResponse;
        } catch {
            return { ...base, detail: 'Response was not valid JSON' };
        }

        base.providerStatus = data?.status;
        base.message = data?.message;

        if (data?.status !== 0 && data?.status !== 1) {
            return { ...base, detail: `Unexpected status value: ${JSON.stringify(data?.status)}` };
        }

        if (data.status === 0) {
            return { ...base, kind: 'empty' };
        }

        const key = `${line}-${station}`;
        const stationData = data?.data?.[key];
        if (!stationData) {
            // A stop can legitimately have no data key when no trains are running
            // in either direction, but the provider normally returns status 1 with
            // an empty UP/DOWN array.
            return { ...base, detail: `Missing data key "${key}" (keys: ${Object.keys(data?.data ?? {}).join(', ') || 'none'})` };
        }

        const up = stationData.UP ?? [];
        const down = stationData.DOWN ?? [];
        if (!Array.isArray(up) || !Array.isArray(down)) {
            return { ...base, detail: 'UP/DOWN is not an array' };
        }

        const invalidEtas = [...up, ...down].filter(eta => {
            if (!eta || typeof eta !== 'object') return true;
            const entry = eta as { dest?: unknown; ttnt?: unknown };
            return typeof entry.dest !== 'string' || typeof entry.ttnt !== 'string';
        });
        if (invalidEtas.length > 0) {
            return { ...base, detail: `${invalidEtas.length} ETA entries missing dest/ttnt` };
        }

        return { ...base, kind: 'ok', up: up.length, down: down.length };
    } catch (error) {
        return { ...base, detail: error instanceof Error ? error.message : String(error) };
    }
}

async function mapWithConcurrency<T, R>(
    items: T[],
    limit: number,
    fn: (item: T) => Promise<R>
): Promise<R[]> {
    const results = new Array<R>(items.length);
    let nextIndex = 0;

    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (true) {
            const index = nextIndex++;
            if (index >= items.length) return;
            results[index] = await fn(items[index]);
        }
    });

    await Promise.all(workers);
    return results;
}

function buildReport(results: CheckResult[]): string {
    const lines = [...new Set(results.map(r => r.line))];
    const rows = lines.map(line => {
        const lineResults = results.filter(r => r.line === line);
        const ok = lineResults.filter(r => r.kind === 'ok').length;
        const empty = lineResults.filter(r => r.kind === 'empty').length;
        const hard = lineResults.filter(r => r.kind === 'hard').length;
        return `${line.padEnd(4)} ok=${String(ok).padStart(2)} empty=${String(empty).padStart(2)} failed=${String(hard).padStart(2)} / ${lineResults.length}`;
    });

    const problems = results.filter(r => r.kind === 'hard');
    const empties = results.filter(r => r.kind === 'empty');

    return [
        'MTR live API check',
        '------------------',
        ...rows,
        '',
        `Stations checked : ${results.length}`,
        `OK               : ${results.filter(r => r.kind === 'ok').length}`,
        `Empty (status 0) : ${empties.length}`,
        `Failed           : ${problems.length}`,
        ...(empties.length > 0
            ? ['', 'Empty responses:', ...empties.map(r => `  - ${r.line}-${r.station} (${r.group})${r.message ? `: ${r.message}` : ''}`)]
            : []),
        ...(problems.length > 0
            ? ['', 'Failures:', ...problems.map(r => `  - ${r.line}-${r.station} (${r.group}): ${r.detail}`)]
            : []),
    ].join('\n');
}

describe.skipIf(!isLiveMode)('MTR live API', () => {
    it('every configured line/station returns a well-formed response', async () => {
        const pairs = configuredPairs();
        expect(pairs.length).toBeGreaterThan(0);

        const results = await mapWithConcurrency(pairs, MAX_CONCURRENCY, checkPair);
        console.log(`\n${buildReport(results)}\n`);

        const failures = results.filter(r => r.kind === 'hard');
        expect(failures, buildReport(failures)).toEqual([]);

        // Every line must have at least one working station. This catches a
        // whole-line outage without failing when individual stations have no
        // remaining trains late at night.
        const lines = [...new Set(results.map(r => r.line))];
        const deadLines = lines.filter(line =>
            results.filter(r => r.line === line).every(r => r.kind !== 'ok')
        );
        expect(deadLines, `No station returned live data for: ${deadLines.join(', ')}`).toEqual([]);
    }, 60_000);
});
