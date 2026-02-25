import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';

// Provide a noop localStorage for the persist middleware in Node
beforeEach(() => {
  (global as any).localStorage = {
    getItem: (_: string) => null,
    setItem: (_: string, __: string) => {},
    removeItem: (_: string) => {},
    clear: () => {}
  };
  // reset store to defaults by directly setting state
  useAppStore.setState({
    currentTab: 'MTR',
    language: 'EN',
    searchQuery: '',
    selectedStation: null,
    favoriteStations: []
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
