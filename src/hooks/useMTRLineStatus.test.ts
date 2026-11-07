import { describe, it, expect } from 'vitest';
import { deriveStatus } from './useMTRLineStatus';

describe('deriveStatus', () => {
    it('reports no-data results as unknown rather than special', () => {
        const result = deriveStatus({ up: [], down: [], offline: true, noData: true });
        expect(result).toBe('unknown');
    });

    it('reports genuine special arrangements as special', () => {
        const result = deriveStatus({
            up: [],
            down: [],
            offline: true,
            serviceStatus: { isDelayed: false, isSpecial: true, message: 'Typhoon signal no. 8' },
        });
        expect(result).toBe('special');
    });

    it('reports delays as delayed', () => {
        const result = deriveStatus({ up: [], down: [], delayed: true });
        expect(result).toBe('delayed');
    });
});
