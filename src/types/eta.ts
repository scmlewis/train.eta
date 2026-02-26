export interface ETA {
    id: string; // Unique ID for React keys
    destination: string;
    time: string; // ISO String or valid transport time
    platform?: string;
    tti?: string; // Original raw time string (e.g. "3 mins")
    ttiMinutes?: number | null; // Parsed minutes as number when available (0,1,2...)
    status?: 'DEPARTING'|'DEPARTED'|'IN_SERVICE'|'SCHEDULED'|'UNKNOWN';
    routeNo?: string;
    trainLength?: number;
    isScheduled?: boolean;
}

export type TransportMode = 'MTR' | 'LRT' | 'BUS';

export interface Station {
    id: string; // e.g. "TUC" for MTR, "1" for LRT, routeName for Bus
    name: string; // e.g. "Tung Chung", "Tuen Mun"
    line?: string; // e.g. "TCL", "507"
    mode: TransportMode;
    lat?: number;
    lng?: number;
}
