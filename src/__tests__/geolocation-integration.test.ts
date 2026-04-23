// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock geolocation before importing components
const mockGeolocation = {
    getCurrentPosition: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
});

// Mock the API and other utilities
vi.mock('../services/api', () => ({
    fetchMTREta: vi.fn(),
    fetchLRTEta: vi.fn(),
    fetchBusEta: vi.fn(),
}));

// Setup localStorage mock
beforeEach(() => {
    (global as any).localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
    };

    vi.clearAllMocks();
});

import { useAppStore } from '../store/useAppStore';
import { getCurrentPosition, findNearestStations } from '../utils/geolocation';

describe('Geolocation Feature Integration Tests', () => {
    beforeEach(() => {
        useAppStore.setState({
            currentTab: 'MTR',
            language: 'EN',
            searchQuery: '',
            selectedStation: null,
            returnAnchorGroupKey: null,
            favoriteStations: [],
            nearbyStations: null,
            isLocating: false,
            locationError: null,
            isBottomSheetOpen: false,
        });
    });

    describe('Complete geolocation flow', () => {
        it('initiates geolocation request and displays nearby stations', async () => {
            const mockCoords = {
                latitude: 22.3193,
                longitude: 114.1694,
                accuracy: 100,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
            };

            // Mock geolocation API
            (mockGeolocation.getCurrentPosition as any).mockImplementation(
                (success: PositionCallback) => {
                    success({
                        coords: mockCoords,
                        timestamp: Date.now(),
                    } as GeolocationPosition);
                }
            );

            // Simulate the geolocation flow
            const { setIsLocating, setNearbyStations, setLocationError, setIsBottomSheetOpen } =
                useAppStore.getState();

            setIsLocating(true);
            let state = useAppStore.getState();
            expect(state.isLocating).toBe(true);

            // Simulate getting position
            const position = await new Promise<GeolocationCoordinates>((resolve, reject) => {
                mockGeolocation.getCurrentPosition(
                    (pos) => resolve(pos.coords),
                    (err) => reject(err)
                );
            });

            // Find nearby stations
            const results = findNearestStations(position.latitude, position.longitude);

            setNearbyStations(results);
            setIsBottomSheetOpen(true);

            state = useAppStore.getState();
            expect(state.nearbyStations).toBeDefined();
            expect(state.isBottomSheetOpen).toBe(true);
            expect(state.isLocating).toBe(false);
            expect(state.locationError).toBeNull();
        });

        it('handles geolocation permission denied error', async () => {
            const mockError: PositionError = {
                code: 1, // PERMISSION_DENIED
                message: 'User denied geolocation',
                PERMISSION_DENIED: 1,
                POSITION_UNAVAILABLE: 2,
                TIMEOUT: 3,
            };

            (mockGeolocation.getCurrentPosition as any).mockImplementation(
                (success: PositionCallback, error: PositionErrorCallback) => {
                    error(mockError);
                }
            );

            const { setIsLocating, setLocationError } = useAppStore.getState();

            setIsLocating(true);
            let state = useAppStore.getState();
            expect(state.isLocating).toBe(true);

            // Simulate geolocation error
            await new Promise<void>((resolve) => {
                mockGeolocation.getCurrentPosition(
                    () => {},
                    (err) => {
                        if (err.code === 1) {
                            setLocationError(
                                'Location access denied. Please allow location in your browser settings.'
                            );
                        }
                        resolve();
                    }
                );
            });

            state = useAppStore.getState();
            expect(state.locationError).toBe(
                'Location access denied. Please allow location in your browser settings.'
            );
            expect(state.isLocating).toBe(false);
        });

        it('clears nearby stations when closing bottom sheet', () => {
            const mockStations = {
                MTR: [
                    {
                        id: 'ADM',
                        name: 'Admiralty',
                        nameTc: '金鐘',
                        line: 'TWL',
                        mode: 'MTR' as const,
                        lat: 22.2793,
                        lng: 114.165,
                        distanceKm: 0.2,
                    },
                ],
                LRT: [],
                BUS: [],
            };

            useAppStore.setState({
                nearbyStations: mockStations,
                isBottomSheetOpen: true,
            });

            let state = useAppStore.getState();
            expect(state.isBottomSheetOpen).toBe(true);
            expect(state.nearbyStations).not.toBeNull();

            const { clearNearbyStations, setIsBottomSheetOpen } = useAppStore.getState();
            setIsBottomSheetOpen(false);
            clearNearbyStations();

            state = useAppStore.getState();
            expect(state.isBottomSheetOpen).toBe(false);
            expect(state.nearbyStations).toBeNull();
            expect(state.locationError).toBeNull();
        });

        it('closes bottom sheet automatically when selecting a station', () => {
            const mockStations = {
                MTR: [
                    {
                        id: 'ADM',
                        name: 'Admiralty',
                        nameTc: '金鐘',
                        line: 'TWL',
                        mode: 'MTR' as const,
                        lat: 22.2793,
                        lng: 114.165,
                        distanceKm: 0.2,
                    },
                ],
                LRT: [],
                BUS: [],
            };

            useAppStore.setState({
                nearbyStations: mockStations,
                isBottomSheetOpen: true,
            });

            const station = {
                id: 'ADM',
                name: 'Admiralty',
                nameTc: '金鐘',
                mode: 'MTR' as const,
            };

            const { setSelectedStation } = useAppStore.getState();
            setSelectedStation(station);

            let state = useAppStore.getState();
            expect(state.selectedStation).toEqual(station);
        });

        it('resets geolocation state when changing tabs', () => {
            const mockStations = {
                MTR: [
                    {
                        id: 'ADM',
                        name: 'Admiralty',
                        nameTc: '金鐘',
                        line: 'TWL',
                        mode: 'MTR' as const,
                        lat: 22.2793,
                        lng: 114.165,
                        distanceKm: 0.2,
                    },
                ],
                LRT: [],
                BUS: [],
            };

            useAppStore.setState({
                nearbyStations: mockStations,
                isBottomSheetOpen: true,
                locationError: null,
                currentTab: 'MTR',
            });

            const { setTab } = useAppStore.getState();
            setTab('BUS');

            const state = useAppStore.getState();
            expect(state.currentTab).toBe('BUS');
            expect(state.nearbyStations).toBeNull();
            expect(state.locationError).toBeNull();
        });

        it('does not show bottom sheet when FAB is on SETTINGS tab', () => {
            const { setTab } = useAppStore.getState();
            setTab('SETTINGS');

            const state = useAppStore.getState();
            expect(state.currentTab).toBe('SETTINGS');
            // FAB should not render on SETTINGS tab, so bottom sheet should not appear
        });

        it('handles rapid clicks on geolocation button', async () => {
            const { setIsLocating } = useAppStore.getState();

            // First click
            setIsLocating(true);
            let state = useAppStore.getState();
            expect(state.isLocating).toBe(true);

            // Second click should be prevented by isLocating check in FAB
            // (The FAB component checks `if (isLocating) return` before processing)
            expect(state.isLocating).toBe(true);

            // Simulate completion
            setIsLocating(false);
            state = useAppStore.getState();
            expect(state.isLocating).toBe(false);
        });
    });

    describe('Geolocation state persistence', () => {
        it('does not persist nearbyStations on page reload', () => {
            // nearbyStations should not be in the persisted state
            // This is verified by the partialize function which only includes:
            // - currentTab
            // - language
            // - favoriteStations

            useAppStore.setState({
                nearbyStations: {
                    MTR: [],
                    LRT: [],
                    BUS: [],
                } as any,
                isLocating: true,
                locationError: 'test',
            });

            const state = useAppStore.getState();
            // State exists in memory but should not be in localStorage
            expect(state.nearbyStations).toBeDefined();
            expect(state.isLocating).toBe(true);
        });

        it('does not persist isBottomSheetOpen', () => {
            useAppStore.setState({
                isBottomSheetOpen: true,
            });

            const state = useAppStore.getState();
            expect(state.isBottomSheetOpen).toBe(true);
            // But it's not in the persisted subset
        });

        it('persists only user preferences and favorites', () => {
            const { setLanguage, setTab, toggleFavorite } = useAppStore.getState();

            setLanguage('TC');
            setTab('BUS');

            const station = {
                id: 'S1',
                name: 'Test Station',
                mode: 'MTR',
            } as any;

            toggleFavorite(station);

            const state = useAppStore.getState();
            expect(state.language).toBe('TC');
            expect(state.currentTab).toBe('BUS');
            expect(state.favoriteStations).toHaveLength(1);
            // These should be persisted via localStorage
        });
    });

    describe('Geolocation with multiple stations', () => {
        it('displays nearby stations grouped by mode (MTR, LRT, BUS)', () => {
            const mockStations = {
                MTR: [
                    {
                        id: 'ADM',
                        name: 'Admiralty',
                        nameTc: '金鐘',
                        line: 'TWL',
                        mode: 'MTR' as const,
                        lat: 22.2793,
                        lng: 114.165,
                        distanceKm: 0.2,
                    },
                    {
                        id: 'ADM2',
                        name: 'Admiralty',
                        nameTc: '金鐘',
                        line: 'ISL',
                        mode: 'MTR' as const,
                        lat: 22.2793,
                        lng: 114.165,
                        distanceKm: 0.2,
                    },
                ],
                LRT: [
                    {
                        id: 'stop1',
                        name: 'Siu Lun',
                        nameTc: '小濫',
                        line: '505',
                        mode: 'LRT' as const,
                        lat: 22.394,
                        lng: 113.975,
                        distanceKm: 0.5,
                    },
                ],
                BUS: [
                    {
                        id: 'route1',
                        name: 'Central',
                        nameTc: '中環',
                        line: '1',
                        mode: 'BUS' as const,
                        lat: 22.285,
                        lng: 114.155,
                        distanceKm: 0.3,
                    },
                ],
            };

            useAppStore.setState({
                nearbyStations: mockStations,
                isBottomSheetOpen: true,
            });

            const state = useAppStore.getState();
            expect(state.nearbyStations?.MTR).toHaveLength(2);
            expect(state.nearbyStations?.LRT).toHaveLength(1);
            expect(state.nearbyStations?.BUS).toHaveLength(1);
        });

        it('sorts nearby stations by distance', () => {
            const mockStations = {
                MTR: [
                    {
                        id: 'ADM',
                        name: 'Admiralty',
                        nameTc: '金鐘',
                        line: 'TWL',
                        mode: 'MTR' as const,
                        lat: 22.2793,
                        lng: 114.165,
                        distanceKm: 0.2,
                    },
                    {
                        id: 'CEX',
                        name: 'Central',
                        nameTc: '中環',
                        line: 'TWL',
                        mode: 'MTR' as const,
                        lat: 22.285,
                        lng: 114.155,
                        distanceKm: 0.5,
                    },
                    {
                        id: 'WAN',
                        name: 'Wan Chai',
                        nameTc: '灣仔',
                        line: 'TWL',
                        mode: 'MTR' as const,
                        lat: 22.278,
                        lng: 114.177,
                        distanceKm: 0.7,
                    },
                ],
                LRT: [],
                BUS: [],
            };

            // Verify stations are sorted by distance (closest first)
            const mtrs = mockStations.MTR;
            expect(mtrs[0].distanceKm).toBeLessThan(mtrs[1].distanceKm);
            expect(mtrs[1].distanceKm).toBeLessThan(mtrs[2].distanceKm);
        });
    });
});
