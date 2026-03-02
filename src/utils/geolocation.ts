import { MTR_LINE_GROUPS, LRT_GROUPS, BUS_GROUPS } from '../constants/transportData';
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
// Candidate station builder
// ---------------------------------------------------------------------------

type Candidate = Station & { distanceKm: number };

/**
 * Builds a deduplicated list of stations with resolved coordinates.
 * MTR  → dedup by station ID (globally unique)
 * LRT  → dedup by English stop name (stop IDs are route-local, not globally unique)
 * BUS  → dedup by stop ID
 */
function buildCandidates(userLat: number, userLng: number): Candidate[] {
    const candidates: Candidate[] = [];

    // ---- MTR ----
    const seenMTR = new Set<string>();
    for (const group of MTR_LINE_GROUPS) {
        const line = typeof group.groupName === 'string' ? group.groupName : group.groupName.en;
        for (const s of group.stations) {
            if (seenMTR.has(s.id)) continue;
            const coords = MTR_STATION_COORDS[s.id];
            if (!coords) continue;
            seenMTR.add(s.id);
            const name = typeof s.name === 'string' ? s.name : s.name.en;
            candidates.push({
                id: s.id,
                name,
                line: s.line,
                mode: 'MTR',
                lat: coords.lat,
                lng: coords.lng,
                distanceKm: haversineDistanceKm(userLat, userLng, coords.lat, coords.lng),
            });
        }
        void line; // suppress unused-var lint
    }

    // ---- LRT ----
    const seenLRT = new Set<string>(); // keyed by English name
    for (const group of LRT_GROUPS) {
        const routeNo = typeof group.groupName === 'string' ? group.groupName : group.groupName.en;
        for (const s of group.stations) {
            const nameObj = typeof s.name === 'string' ? { en: s.name, tc: s.name } : s.name;
            const nameEn = nameObj.en;
            if (seenLRT.has(nameEn)) continue;
            const coords = LRT_STOP_COORDS[nameEn];
            if (!coords) continue;
            seenLRT.add(nameEn);
            candidates.push({
                id: s.id,
                name: nameEn,
                line: routeNo,
                mode: 'LRT',
                lat: coords.lat,
                lng: coords.lng,
                distanceKm: haversineDistanceKm(userLat, userLng, coords.lat, coords.lng),
            });
        }
    }

    // ---- BUS ----
    const seenBus = new Set<string>();
    for (const group of BUS_GROUPS) {
        const routeNo = typeof group.groupName === 'string' ? group.groupName : group.groupName.en;
        for (const s of group.stations) {
            if (seenBus.has(s.id)) continue;
            const coords = BUS_STOP_COORDS[s.id];
            if (!coords) continue;
            seenBus.add(s.id);
            const nameObj = typeof s.name === 'string' ? { en: s.name, tc: s.name } : s.name;
            candidates.push({
                id: s.id,
                name: nameObj.en,
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

/**
 * Returns up to `limit` stations nearest to the given coordinates,
 * sorted ascending by distance, with `distanceKm` populated.
 */
export function findNearestStations(
    userLat: number,
    userLng: number,
    limit = 3,
): (Station & { distanceKm: number })[] {
    const candidates = buildCandidates(userLat, userLng);
    candidates.sort((a, b) => a.distanceKm - b.distanceKm);
    return candidates.slice(0, limit);
}
