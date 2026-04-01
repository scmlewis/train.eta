import { MTR_LINE_GROUPS, LRT_GROUPS, BUS_GROUPS } from '../constants/transportData';
import { MTR_STATIONS } from '../constants/mtrData';
import {
    MTR_STATION_COORDS,
    LRT_STOP_COORDS,
    BUS_STOP_COORDS,
} from '../constants/stationCoords';
import type { Station } from '../types/eta';

// ---------------------------------------------------------------------------
// Browser Geolocation wrapper
// ---------------------------------------------------------------------------

/** Resolves with the browser GeolocationCoordinates or rejects with a string. */
export function getCurrentPosition(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('Geolocation is not supported by this browser.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            (err) => {
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        reject('Location access denied. Please allow location in your browser settings.');
                        break;
                    case err.POSITION_UNAVAILABLE:
                        reject('Location information is unavailable.');
                        break;
                    case err.TIMEOUT:
                        reject('Location request timed out.');
                        break;
                    default:
                        reject('An unknown location error occurred.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
        );
    });
}

// ---------------------------------------------------------------------------
// Haversine distance
// ---------------------------------------------------------------------------

const EARTH_RADIUS_KM = 6371;

/** Returns the great-circle distance in kilometres between two lat/lng points. */
export function haversineDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

// ---------------------------------------------------------------------------
// MTR line code → bilingual name lookup  (e.g. 'ISL' → { en: 'Island Line', tc: '港島綫' })
// ---------------------------------------------------------------------------

/** Maps raw API line codes (KTL, ISL …) to bilingual display names. */
export const MTR_LINE_NAMES: Record<string, { en: string; tc: string }> = {};
for (const group of MTR_LINE_GROUPS) {
    for (const station of group.stations) {
        if (station.line && !MTR_LINE_NAMES[station.line]) {
            MTR_LINE_NAMES[station.line] =
                typeof group.groupName === 'string'
                    ? { en: group.groupName, tc: group.groupName }
                    : group.groupName;
        }
    }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NearbyStation = Station & { distanceKm: number };

/** Grouped result shape — up to limitPerMode entries per transport mode. */
export interface NearbyStationGroups {
    MTR: NearbyStation[];
    LRT: NearbyStation[];
    BUS: NearbyStation[];
}

// ---------------------------------------------------------------------------
// Candidate builder
// ---------------------------------------------------------------------------

function buildCandidates(userLat: number, userLng: number): NearbyStation[] {
    const candidates: NearbyStation[] = [];

    // ---- MTR ----
    for (const group of MTR_LINE_GROUPS) {
        for (const s of group.stations) {
            const coords = MTR_STATION_COORDS[s.id];
            if (!coords) continue;
            const names = MTR_STATIONS[s.id];
            candidates.push({
                id: s.id,
                name: names?.en ?? (typeof s.name === 'string' ? s.name : s.name.en),
                nameTc: names?.tc,
                line: s.line,
                mode: 'MTR',
                lat: coords.lat,
                lng: coords.lng,
                distanceKm: haversineDistanceKm(userLat, userLng, coords.lat, coords.lng),
            });
        }
    }

    // ---- LRT ----
    for (const group of LRT_GROUPS) {
        const routeNo = typeof group.groupName === 'string' ? group.groupName : group.groupName.en;
        for (const s of group.stations) {
            const nameObj = typeof s.name === 'string' ? { en: s.name, tc: s.name } : s.name;
            const nameEn = nameObj.en;
            const coords = LRT_STOP_COORDS[nameEn];
            if (!coords) continue;
            candidates.push({
                id: s.id,
                name: nameEn,
                nameTc: nameObj.tc,
                line: routeNo,
                mode: 'LRT',
                lat: coords.lat,
                lng: coords.lng,
                distanceKm: haversineDistanceKm(userLat, userLng, coords.lat, coords.lng),
            });
        }
    }

    // ---- BUS ----
    for (const group of BUS_GROUPS) {
        const routeNo = typeof group.groupName === 'string' ? group.groupName : group.groupName.en;
        for (const s of group.stations) {
            const coords = BUS_STOP_COORDS[s.id];
            if (!coords) continue;
            const nameObj = typeof s.name === 'string' ? { en: s.name, tc: s.name } : s.name;
            candidates.push({
                id: s.id,
                name: nameObj.en,
                nameTc: nameObj.tc,
                line: routeNo,
                mode: 'BUS',
                lat: coords.lat,
                lng: coords.lng,
                distanceKm: haversineDistanceKm(userLat, userLng, coords.lat, coords.lng),
            });
        }
    }

    return candidates;
}

// ---------------------------------------------------------------------------
// Main public function
// ---------------------------------------------------------------------------

/** Maximum walking distance (km) — stations beyond this are not shown. */
export const NEARBY_THRESHOLD_KM = 3;

/**
 * Returns the nearest stations grouped by transport mode (MTR / LRT / BUS).
 * Each group is sorted ascending by distance, filtered to within NEARBY_THRESHOLD_KM,
 * and capped at `limitPerMode` entries.
 */
export function findNearestStations(
    userLat: number,
    userLng: number,
    limitPerMode = 3,
): NearbyStationGroups {
    const all = buildCandidates(userLat, userLng);

    const pick = (mode: 'MTR' | 'LRT' | 'BUS') =>
        all
            .filter((s) => s.mode === mode && s.distanceKm <= NEARBY_THRESHOLD_KM)
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, limitPerMode);

    return {
        MTR: pick('MTR'),
        LRT: pick('LRT'),
        BUS: pick('BUS'),
    };
}
