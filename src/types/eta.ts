export interface ETA {
    id: string; // Unique ID for React keys
    destination: string;
    time: string; // ISO String or valid transport time
    platform?: string;
    tti?: string; // Time to incident/arrival in string (e.g. "3 mins")
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
