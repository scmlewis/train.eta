import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Station, TransportMode } from '../types/eta';
import type { NearbyStationGroups } from '../utils/geolocation';

export type TabId = TransportMode | 'FAV' | 'SETTINGS';

export type FontSize = 'small' | 'default' | 'large';

/** Bump whenever persisted state needs a migration. */
export const PERSIST_VERSION = 2;

// Station codes that were replaced in the MTR feed. Persisted favourites and the
// last selected station may still carry the old ids, so map them on rehydrate.
const RETIRED_MTR_STATION_IDS: Record<string, string> = {
    LUM: 'LOP',
    SHF: 'SHM',
};

function migrateStation(station: Station | null | undefined): Station | null | undefined {
    if (!station) return station;
    const newId = RETIRED_MTR_STATION_IDS[station.id];
    return newId ? { ...station, id: newId } : station;
}

/** Maps persisted state written by an older app version onto the current schema. */
export function migratePersistedState(persistedState: unknown): unknown {
    if (!persistedState || typeof persistedState !== 'object') return persistedState;

    const state = persistedState as Record<string, unknown>;
    const next: Record<string, unknown> = { ...state };

    if ('selectedStation' in state) {
        const migrated = migrateStation(state.selectedStation as Station | null | undefined);
        next.selectedStation = migrated ?? null;
    }

    if (Array.isArray(state.favoriteStations)) {
        next.favoriteStations = state.favoriteStations
            .map(s => migrateStation(s as Station))
            .filter((s): s is Station => Boolean(s));
    }

    return next;
}

interface AppState {
    currentTab: TabId;
    language: 'EN' | 'TC';
    fontSize: FontSize;
    searchQuery: string;
    selectedStation: Station | null;
    returnAnchorGroupKey: string | null;
    favoriteStations: Station[];
    // Geolocation state (not persisted)
    nearbyStations: NearbyStationGroups | null;
    isLocating: boolean;
    locationError: string | null;
    isBottomSheetOpen: boolean;
    setTab: (tab: TabId) => void;
    setLanguage: (lang: 'EN' | 'TC') => void;
    setFontSize: (size: FontSize) => void;
    setSearchQuery: (query: string) => void;
    setSelectedStation: (station: Station | null) => void;
    setReturnAnchorGroupKey: (groupKey: string | null) => void;
    toggleFavorite: (station: Station) => void;
    setNearbyStations: (stations: NearbyStationGroups | null) => void;
    setIsLocating: (locating: boolean) => void;
    setLocationError: (error: string | null) => void;
    clearNearbyStations: () => void;
    setIsBottomSheetOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            currentTab: 'MTR',
            language: 'EN',
            fontSize: 'default',
            searchQuery: '',
            selectedStation: null,
            returnAnchorGroupKey: null,
            favoriteStations: [],
            nearbyStations: null,
            isLocating: false,
            locationError: null,
            isBottomSheetOpen: false,
            setTab: (tab) => set({ currentTab: tab, searchQuery: '', selectedStation: null, returnAnchorGroupKey: null, nearbyStations: null, locationError: null }),
            setLanguage: (lang) => set({ language: lang }),
            setFontSize: (size) => set({ fontSize: size }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setSelectedStation: (station) => set({ selectedStation: station }),
            setReturnAnchorGroupKey: (groupKey) => set({ returnAnchorGroupKey: groupKey }),
            toggleFavorite: (station) => set((state) => {
                const isFavorite = state.favoriteStations.some(s => s.id === station.id && s.mode === station.mode);
                if (isFavorite) {
                    return {
                        favoriteStations: state.favoriteStations.filter(s => !(s.id === station.id && s.mode === station.mode))
                    };
                }
                return {
                    favoriteStations: [...state.favoriteStations, station]
                };
            }),
            setNearbyStations: (stations) => set({ nearbyStations: stations, isLocating: false, locationError: null }),
            setIsLocating: (locating) => set({ isLocating: locating, locationError: null }),
            setLocationError: (error) => set({ locationError: error, isLocating: false }),
            clearNearbyStations: () => set({ nearbyStations: null, locationError: null }),
            setIsBottomSheetOpen: (open) => set({ isBottomSheetOpen: open }),
        }),
        {
            name: 'train-eta-storage',
            version: PERSIST_VERSION,
            migrate: (persistedState) => migratePersistedState(persistedState) as AppState,
            // Only persist user preferences and favourites — not ephemeral location state
            partialize: (state) => ({
                currentTab: state.currentTab,
                language: state.language,
                fontSize: state.fontSize,
                favoriteStations: state.favoriteStations,
                selectedStation: state.selectedStation,
            }),
        }
    )
);
