// Minimal raw API payload types for MTR/LRT/Bus responses

export interface RawMTRStationData {
    UP?: any[];
    DOWN?: any[];
}

export interface RawMTRResponse {
    status?: number;
    message?: string;
    data?: Record<string, RawMTRStationData>;
    isdelay?: string;
    [k: string]: any;
}

// Minimal LRT response shape (platform_list containing platform objects with route_list)
export interface RawLRTRoute {
    dest_en?: string;
    dest_ch?: string;
    time_en?: string;
    time_ch?: string;
    train_length?: string | number;
    route_no?: string;
    [k: string]: any;
}

export interface RawLRTPlatform {
    platform_id?: string | number;
    route_list?: RawLRTRoute[];
    [k: string]: any;
}

export interface RawLRTResponse {
    system_time?: string;
    platform_list?: RawLRTPlatform[];
    [k: string]: any;
}

// Minimal Bus response shape used by normalizeBus/fetchRouteStops
export interface RawBusEntry {
    busId?: string | number;
    departureTimeInSecond?: string | number;
    departureTimeText?: string;
    destEn?: string;
    destCh?: string;
    isScheduled?: string;
    [k: string]: any;
}

export interface RawBusStop {
    busStopId?: string;
    bus?: RawBusEntry[];
    [k: string]: any;
}

export interface RawBusResponse {
    routeName?: string;
    busStop?: RawBusStop[];
    [k: string]: any;
}

