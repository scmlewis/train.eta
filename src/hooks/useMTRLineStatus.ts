import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchMTR, type MTRResult } from '../services/api';

export type LineStatus = 'normal' | 'delayed' | 'special' | 'unknown';

export interface MTRLineStatusEntry {
    line: string;
    status: LineStatus;
    message?: string;
    alertUrl?: string;
}

// One sentinel station per MTR line (terminus stations chosen for reliability)
const SENTINEL_STATIONS: Record<string, string> = {
    TCL: 'TUC',   // Tung Chung Line → Tung Chung
    TWL: 'TSW',   // Tsuen Wan Line → Tsuen Wan
    KTL: 'KWT',   // Kwun Tong Line → Kwun Tong
    ISL: 'CHW',   // Island Line → Chai Wan
    SIL: 'SOH',   // South Island Line → South Horizons
    TKL: 'TKO',   // Tseung Kwan O Line → Tseung Kwan O
    EAL: 'SHS',   // East Rail Line → Sheung Shui
    TML: 'WKS',   // Tuen Ma Line → Wu Kai Sha
    DRL: 'DIS',   // Disneyland Resort Line → Disneyland Resort
    AEL: 'AIR',   // Airport Express → Airport
};

const LINE_KEYS = Object.keys(SENTINEL_STATIONS);

function deriveStatus(result: MTRResult): LineStatus {
    if (result.offline) return 'special';
    if (result.delayed) return 'delayed';
    if (result.serviceStatus?.isSpecial) return 'special';
    if (result.serviceStatus?.isDelayed) return 'delayed';
    return 'normal';
}

async function fetchAllLineStatuses(): Promise<MTRLineStatusEntry[]> {
    const results = await Promise.allSettled(
        LINE_KEYS.map(async (line) => {
            const station = SENTINEL_STATIONS[line];
            const result = await fetchMTR(line, station);
            return {
                line,
                status: deriveStatus(result),
                message: result.message || result.serviceStatus?.message,
                alertUrl: result.serviceStatus?.alertUrl,
            };
        })
    );

    return results.map((r, i) => {
        if (r.status === 'fulfilled') return r.value;
        return { line: LINE_KEYS[i], status: 'unknown' as LineStatus };
    });
}

/**
 * Polls one sentinel station per MTR line to derive line-wide delay status.
 * Only polls when `enabled` is true (intended to be false when MTR tab is not active).
 */
export function useMTRLineStatus(enabled = true) {
    const query = useQuery<MTRLineStatusEntry[], Error>({
        queryKey: ['mtrLineStatus'],
        queryFn: fetchAllLineStatuses,
        refetchInterval: 60_000,
        staleTime: 45_000,
        enabled,
    });

    const statusMap = useCallback(() => {
        if (!query.data) return new Map<string, MTRLineStatusEntry>();
        return new Map(query.data.map(e => [e.line, e]));
    }, [query.data]);

    return {
        ...query,
        statusMap: statusMap(),
    };
}
