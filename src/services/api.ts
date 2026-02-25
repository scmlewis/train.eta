import type { ETA } from '../types/eta';

const API_TIMEOUT = 10000;

const fetchWithTimeout = async (resource: string, options: RequestInit = {}) => {
    const { timeout = API_TIMEOUT } = options as any;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal,
            mode: 'cors',
            credentials: 'omit'
        });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
};

// Normalize Functions

function normalizeMTR(data: any, stationCode: string, lineCode: string): { up: ETA[], down: ETA[] } {
    try {
        // If API explicitly indicates empty contents for this station, treat as no arrivals rather than a hard error.
        if (data && data.message && String(data.message).toLowerCase().includes('empty')) {
            return { up: [], down: [] };
        }
        if (data.status === 0 || data.isdelay === 'Y') {
            throw new Error(data.message || 'MTR Service Delay or Offline');
        }
        const stationData = data.data[`${lineCode}-${stationCode}`];
        if (!stationData) return { up: [], down: [] };

        const mapEtas = (list: any[] = []) => list.filter(item => item.valid === 'Y').map((item, idx) => ({
            id: `mtr-${item.seq}-${idx}`,
            destination: item.dest,
            time: item.time,
            platform: item.plat,
            tti: `${item.ttnt} min`
        }));

        return {
            up: mapEtas(stationData.UP),
            down: mapEtas(stationData.DOWN)
        };
    } catch (error) {
        console.error("MTR Normalization Error:", error);
        throw error;
    }
}

function normalizeLRT(data: any, lang: 'EN' | 'TC' = 'EN'): { platform: string, etas: ETA[] }[] {
    try {
        if (!data.platform_list || data.platform_list.length === 0) return [];

        const isTC = lang === 'TC';

        return data.platform_list.map((plat: any) => {
            const etas = (plat.route_list || []).map((route: any, idx: number) => ({
                id: `lrt-${plat.platform_id}-${idx}`,
                destination: isTC ? route.dest_ch : route.dest_en,
                time: isTC ? route.time_ch : route.time_en,
                platform: String(plat.platform_id),
                tti: isTC ? route.time_ch : route.time_en,
                routeNo: route.route_no,
                trainLength: route.train_length
            }));
            return { platform: String(plat.platform_id), etas };
        });
    } catch (error) {
        console.error("LRT Normalization Error:", error);
        throw error;
    }
}

export function normalizeBus(data: any, lang: 'EN' | 'TC' = 'EN'): (ETA & { stopId: string })[] {
    try {
        if (!data || !data.busStop) return [];
        let allBusEtas: (ETA & { stopId: string })[] = [];
        const now = new Date();
        const isTC = lang === 'TC';

        data.busStop.forEach((stop: any) => {
            if (stop.bus && Array.isArray(stop.bus)) {
                allBusEtas = [...allBusEtas, ...stop.bus.map((b: any, idx: number) => {
                    const departureSecs = parseInt(b.departureTimeInSecond) || 0;
                    const arrivalDate = new Date(now.getTime() + departureSecs * 1000);
                    const absTime = arrivalDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

                    // Prioritize b.destCh/b.destEn if available, otherwise fallback to data.routeName
                    const destination = isTC
                        ? (b.destCh || data.routeName)
                        : (b.destEn || data.routeName);

                    return {
                        id: `bus-${stop.busStopId}-${b.busId || idx}`,
                        destination: destination,
                        time: absTime,
                        tti: b.departureTimeText?.replace(' minutes', ' min').replace(' Minute', ' min').replace(' 分鐘', isTC ? ' 分鐘' : ' min'),
                        platform: stop.busStopId,
                        stopId: stop.busStopId,
                        isScheduled: b.isScheduled === '1'
                    };
                })];
            }
        });
        return allBusEtas;
    } catch (error) {
        console.error("Bus Normalization Error:", error);
        throw error;
    }
}

// Fetchers
export const fetchMTR = async (line: string, station: string) => {
    const url = `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${line}&sta=${station}`;
    try {
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`MTR API responded with ${response.status}: ${text.slice(0, 100)}`);
        }
        const data = await response.json();
        return normalizeMTR(data, station, line);
    } catch (err: any) {
        console.error('MTR fetch error:', err);
        throw new Error(`Failed to fetch MTR data: ${err.message || 'Unknown error'}`);
    }
};

export const fetchLRT = async (stationId: string, lang: 'EN' | 'TC' = 'EN') => {
    const url = `https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule?station_id=${stationId}`;
    try {
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`LRT API responded with ${response.status}: ${text.slice(0, 100)}`);
        }
        const data = await response.json();
        return normalizeLRT(data, lang);
    } catch (err: any) {
        console.error('LRT fetch error:', err);
        throw new Error(`Failed to fetch LRT data: ${err.message || 'Unknown error'}`);
    }
};

export const fetchBus = async (route: string, lang: 'EN' | 'TC' = 'EN') => {
    const params = { language: lang === 'TC' ? 'zh' : 'en', routeName: route };
    const qs = new URLSearchParams(params);
    // Use the actual public API endpoint directly
    const url = `https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule?${qs.toString()}`;

    console.log('[fetchBus] Calling:', url);
    let lastErrMsg = '';

    // Try direct API call first
    try {
        let response = await fetchWithTimeout(url);
        if (response.ok) {
            const rawData = await response.text();
            const cleanData = rawData.replace(/^\uFEFF/, '');
            try {
                const data = JSON.parse(cleanData);
                console.log('[fetchBus] Success with GET:', data);
                return normalizeBus(data, lang);
            } catch (parseErr) {
                lastErrMsg = `GET parse error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`;
                console.warn('[fetchBus] GET parse failed', parseErr);
            }
        } else {
            const txt = await response.text().catch(() => '<no body>');
            lastErrMsg = `GET status ${response.status}: ${txt.slice(0,100)}`;
            console.warn('[fetchBus] GET failed', response.status, txt.slice(0, 100));
        }
    } catch (err: any) {
        lastErrMsg = `GET request error: ${err && err.message}`;
        console.warn('[fetchBus] GET request error', err);
    }

    // Fallback: POST with JSON
    try {
        let response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        if (response.ok) {
            const rawData = await response.text();
            const cleanData = rawData.replace(/^\uFEFF/, '');
            try {
                const data = JSON.parse(cleanData);
                console.log('[fetchBus] Success with POST:', data);
                return normalizeBus(data, lang);
            } catch (parseErr) {
                lastErrMsg = `POST-JSON parse error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`;
                console.warn('[fetchBus] POST parse failed', parseErr);
            }
        } else {
            const txt = await response.text().catch(() => '<no body>');
            lastErrMsg = `POST status ${response.status}: ${txt.slice(0,100)}`;
            console.warn('[fetchBus] POST failed', response.status, txt.slice(0, 100));
        }
    } catch (err: any) {
        lastErrMsg = `POST request error: ${err && err.message}`;
        console.warn('[fetchBus] POST request error', err);
    }

    throw new Error(`Failed to fetch Bus data (${lastErrMsg || 'unknown error'})`);
};
