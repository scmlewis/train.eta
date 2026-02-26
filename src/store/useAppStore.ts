import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Station, TransportMode } from '../types/eta';

export type TabId = TransportMode | 'FAV' | 'SETTINGS';

interface AppState {
    currentTab: TabId;
    language: 'EN' | 'TC';
    searchQuery: string;
    selectedStation: Station | null;
    returnAnchorGroupKey: string | null;
    favoriteStations: Station[];
    setTab: (tab: TabId) => void;
    setLanguage: (lang: 'EN' | 'TC') => void;
    setSearchQuery: (query: string) => void;
    setSelectedStation: (station: Station | null) => void;
    setReturnAnchorGroupKey: (groupKey: string | null) => void;
    toggleFavorite: (station: Station) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            currentTab: 'MTR',
            language: 'EN',
            searchQuery: '',
            selectedStation: null,
            returnAnchorGroupKey: null,
            favoriteStations: [],
            setTab: (tab) => set({ currentTab: tab, searchQuery: '', selectedStation: null, returnAnchorGroupKey: null }),
            setLanguage: (lang) => set({ language: lang }),
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
            })
        }),
        {
            name: 'train-eta-storage',
        }
    )
);
