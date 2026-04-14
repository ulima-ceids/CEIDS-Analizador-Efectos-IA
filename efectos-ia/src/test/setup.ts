import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ── Browser APIs jsdom doesn't provide ──────────────────────
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// ResizeObserver — used by Recharts ResponsiveContainer
global.ResizeObserver = class ResizeObserver {
  observe()   {}
  unobserve() {}
  disconnect() {}
};

// matchMedia — used by some Radix components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches:             false,
    media:               query,
    onchange:            null,
    addListener:         vi.fn(),
    removeListener:      vi.fn(),
    addEventListener:    vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent:       vi.fn(),
  })),
});

// ── WaveSurfer — needs canvas/WebAudio, stub completely ─────
vi.mock('wavesurfer.js', () => ({
  default: {
    create: () => ({
      load:        vi.fn(),
      destroy:     vi.fn(),
      playPause:   vi.fn(),
      setMuted:    vi.fn(),
      getDuration: vi.fn(() => 30),
      on:          vi.fn(),
    }),
  },
}));

// ── crypto.randomUUID shim ───────────────────────────────────
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2) },
    writable: true,
  });
}
