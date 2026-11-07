// Minimal raw API payload types for MTR/LRT/Bus responses

export interface RawMTRTrain {
    time?: string;
    dest?: string;
    plat?: string;
    seq?: string;
    ttnt?: string;
    valid?: string;
    [k: string]: unknown;
}

export interface RawMTRStationData {
    UP?: RawMTRTrain[];
    DOWN?: RawMTRTrain[];
}

export interface RawMTRResponse {
    status?: number;
    message?: string;
    data?: Record<string, RawMTRStationData>;
    isdelay?: string;
    url?: string;
    [k: string]: unknown;
}

// Minimal LRT response shape (platform_list containing platform objects with route_list)
export interface RawLRTRoute {
    dest_en?: string;
    dest_ch?: string;
    time_en?: string;
    time_ch?: string;
    train_length?: string | number;
    route_no?: string;
    [k: string]: unknown;
}

export interface RawLRTPlatform {
    platform_id?: string | number;
    route_list?: RawLRTRoute[];
    [k: string]: unknown;
}

export interface RawLRTResponse {
    system_time?: string;
    platform_list?: RawLRTPlatform[];
    [k: string]: unknown;
}

// Minimal Bus response shape used by normalizeBus/fetchRouteStops
export interface RawBusEntry {
    busId?: string | number;
    departureTimeInSecond?: string | number;
    departureTimeText?: string;
    destEn?: string;
    destCh?: string;
    isScheduled?: string;
    [k: string]: unknown;
}

export interface RawBusStop {
    busStopId?: string;
    bus?: RawBusEntry[];
    [k: string]: unknown;
}

export interface RawBusResponse {
    routeName?: string;
    busStop?: RawBusStop[];
    [k: string]: unknown;
}
