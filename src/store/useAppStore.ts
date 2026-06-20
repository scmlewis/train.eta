import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Station, TransportMode } from '../types/eta';
import type { NearbyStationGroups } from '../utils/geolocation';

export type TabId = TransportMode | 'FAV' | 'SETTINGS';

export type FontSize = 'small' | 'default' | 'large';

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
