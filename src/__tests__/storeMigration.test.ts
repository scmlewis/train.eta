import { describe, it, expect } from 'vitest';
import { migratePersistedState } from '../store/useAppStore';

describe('persisted state migration', () => {
    it('renames retired TML station ids in selectedStation and favourites', () => {
        const persisted = {
            currentTab: 'MTR',
            language: 'EN',
            fontSize: 'default',
            selectedStation: { id: 'LUM', name: 'Long Ping', mode: 'MTR' },
            favoriteStations: [
                { id: 'LUM', name: 'Long Ping', mode: 'MTR' },
                { id: 'SHF', name: 'Shek Mun', mode: 'MTR' },
                { id: 'PRE', name: 'Prince Edward', mode: 'MTR' },
            ],
        };

        const migrated = migratePersistedState(persisted) as typeof persisted;

        expect(migrated.selectedStation.id).toBe('LOP');
        expect(migrated.selectedStation.name).toBe('Long Ping');
        expect(migrated.favoriteStations.map(s => s.id)).toEqual(['LOP', 'SHM', 'PRE']);
    });

    it('leaves unrelated state untouched', () => {
        const persisted = { language: 'TC', fontSize: 'large' };
        expect(migratePersistedState(persisted)).toEqual(persisted);
    });

    it('handles undefined and null safely', () => {
        expect(migratePersistedState(undefined)).toBeUndefined();
        expect(migratePersistedState(null)).toBeNull();
    });
});
