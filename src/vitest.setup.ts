import '@testing-library/jest-dom';

// zustand's persist middleware resolves `window.localStorage` when the store
// module is first imported. jsdom does not always provide one, so install an
// in-memory implementation here (setup files run before any test module) to
// keep the persisted store stable across the suite.
class MemoryStorage implements Storage {
    private store = new Map<string, string>();

    get length(): number {
        return this.store.size;
    }

    clear(): void {
        this.store.clear();
    }

    getItem(key: string): string | null {
        return this.store.has(key) ? this.store.get(key)! : null;
    }

    key(index: number): string | null {
        return Array.from(this.store.keys())[index] ?? null;
    }

    removeItem(key: string): void {
        this.store.delete(key);
    }

    setItem(key: string, value: string): void {
        this.store.set(key, String(value));
    }
}

const storage = new MemoryStorage();

for (const target of [globalThis, typeof window !== 'undefined' ? window : undefined]) {
    if (!target) continue;
    try {
        if (target.localStorage) continue;
    } catch {
        // Access can throw for opaque origins; fall through and define it below.
    }
    Object.defineProperty(target, 'localStorage', {
        value: storage,
        configurable: true,
        writable: true,
    });
}
