import '@testing-library/jest-dom';

// Provide a minimal global fetch mock if tests need it (optional)
if (!(globalThis as any).fetch) {
  (globalThis as any).fetch = async () => ({ ok: true, text: async () => '{}' });
}
