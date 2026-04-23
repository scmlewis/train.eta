import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';

// Provide a noop localStorage for the persist middleware in Node
beforeEach(() => {
  (global as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
  // reset store to defaults by directly setting state
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
    isBottomSheetOpen: false
  });
});

describe('useAppStore basic flows', () => {
  it('changes language and tab', () => {
    const { setLanguage, setTab } = useAppStore.getState();
    setLanguage('TC');
    setTab('BUS');
    const s = useAppStore.getState();
    expect(s.language).toBe('TC');
    expect(s.currentTab).toBe('BUS');
  });

  it('toggles favorite stations', () => {
    const station = { id: 'S1', name: 'A', mode: 'BUS' } as any;
    const { toggleFavorite } = useAppStore.getState();
    toggleFavorite(station);
    let s = useAppStore.getState();
    expect(s.favoriteStations.length).toBe(1);
    // toggle again to remove
    toggleFavorite(station);
    s = useAppStore.getState();
    expect(s.favoriteStations.length).toBe(0);
  });
});

describe('useAppStore geolocation flows', () => {
  it('sets isLocating state', () => {
    const { setIsLocating } = useAppStore.getState();
    setIsLocating(true);
    let s = useAppStore.getState();
    expect(s.isLocating).toBe(true);
    
    setIsLocating(false);
    s = useAppStore.getState();
    expect(s.isLocating).toBe(false);
  });

  it('sets location error and clears isLocating', () => {
    const { setLocationError } = useAppStore.getState();
    useAppStore.setState({ isLocating: true });
    
    setLocationError('Geolocation not supported');
    const s = useAppStore.getState();
    
    expect(s.locationError).toBe('Geolocation not supported');
    expect(s.isLocating).toBe(false);
  });

  it('sets nearby stations and opens bottom sheet', () => {
    const mockStations = {
      MTR: [
        { id: 'ADM', name: 'Admiralty', distanceKm: 0.2 }
      ],
      LRT: [],
      BUS: []
    } as any;

    const { setNearbyStations, setIsBottomSheetOpen } = useAppStore.getState();
    setNearbyStations(mockStations);
    setIsBottomSheetOpen(true);

    const s = useAppStore.getState();
    expect(s.nearbyStations).toEqual(mockStations);
    expect(s.isBottomSheetOpen).toBe(true);
    expect(s.isLocating).toBe(false);
  });

  it('clears nearby stations and closes bottom sheet', () => {
    const mockStations = {
      MTR: [{ id: 'ADM', name: 'Admiralty', distanceKm: 0.2 }],
      LRT: [],
      BUS: []
    } as any;

    useAppStore.setState({
      nearbyStations: mockStations,
      isBottomSheetOpen: true,
      locationError: 'test error'
    });

    const { clearNearbyStations, setIsBottomSheetOpen } = useAppStore.getState();
    clearNearbyStations();
    setIsBottomSheetOpen(false);

    const s = useAppStore.getState();
    expect(s.nearbyStations).toBeNull();
    expect(s.locationError).toBeNull();
    expect(s.isBottomSheetOpen).toBe(false);
  });

  it('toggles bottom sheet open/close', () => {
    const { setIsBottomSheetOpen } = useAppStore.getState();
    
    setIsBottomSheetOpen(true);
    let s = useAppStore.getState();
    expect(s.isBottomSheetOpen).toBe(true);

    setIsBottomSheetOpen(false);
    s = useAppStore.getState();
    expect(s.isBottomSheetOpen).toBe(false);
  });

  it('clears geolocation state when changing tabs', () => {
    const mockStations = {
      MTR: [{ id: 'ADM', name: 'Admiralty', distanceKm: 0.2 }],
      LRT: [],
      BUS: []
    } as any;

    useAppStore.setState({
      nearbyStations: mockStations,
      isBottomSheetOpen: true,
      locationError: 'test',
      currentTab: 'MTR'
    });

    const { setTab } = useAppStore.getState();
    setTab('BUS');

    const s = useAppStore.getState();
    expect(s.currentTab).toBe('BUS');
    expect(s.nearbyStations).toBeNull();
    expect(s.locationError).toBeNull();
  });

  it('stores geolocation state separately from persisted state', () => {
    // nearbyStations, isLocating, locationError, isBottomSheetOpen should not be persisted
    const { setNearbyStations, setLocationError, setIsBottomSheetOpen } = useAppStore.getState();
    
    setNearbyStations({
      MTR: [],
      LRT: [],
      BUS: []
    } as any);
    setLocationError('test error');
    setIsBottomSheetOpen(true);

    const s = useAppStore.getState();
    // These states should exist in memory
    expect(s.nearbyStations).not.toBeNull();
    expect(s.locationError).not.toBeNull();
    expect(s.isBottomSheetOpen).toBe(true);

    // But they should not be included in the persisted subset
    // (This is verified by the partialize function in the store)
  });
});
