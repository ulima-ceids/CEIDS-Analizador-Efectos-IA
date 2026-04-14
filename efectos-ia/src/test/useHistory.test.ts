import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '@/hooks/useHistory';
import type { AnalysisResult } from '@/types';

const makeResult = (id: string): AnalysisResult => ({
  id,
  filename:    `${id}.wav`,
  duration_s:  3.5,
  effect:      'distortion',
  confidence:  0.82,
  parameters:  { gain: 65, tone: 50, bass: 45, mid: 55, treble: 60, reverb: 15 },
  features: {
    rms_db: -20, centroid: 3000, bandwidth: 2200, flatness: 0.3,
    zcr: 160, hp_ratio: 0.55, onset_count: 10, reverb_ratio: 0.15,
  },
  analyzed_at: new Date().toISOString(),
});

describe('useHistory', () => {
  beforeEach(() => localStorage.clear());

  it('starts with empty entries when localStorage is empty', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.entries).toHaveLength(0);
  });

  it('adds an entry', () => {
    const { result } = renderHook(() => useHistory());
    act(() => result.current.addEntry(makeResult('song1')));
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].id).toBe('song1');
  });

  it('prepends new entries (most recent first)', () => {
    const { result } = renderHook(() => useHistory());
    act(() => result.current.addEntry(makeResult('first')));
    act(() => result.current.addEntry(makeResult('second')));
    expect(result.current.entries[0].id).toBe('second');
    expect(result.current.entries[1].id).toBe('first');
  });

  it('deduplicates by id', () => {
    const { result } = renderHook(() => useHistory());
    act(() => result.current.addEntry(makeResult('dup')));
    act(() => result.current.addEntry(makeResult('dup')));
    expect(result.current.entries).toHaveLength(1);
  });

  it('removes an entry by id', () => {
    const { result } = renderHook(() => useHistory());
    act(() => result.current.addEntry(makeResult('toRemove')));
    act(() => result.current.addEntry(makeResult('keep')));
    act(() => result.current.removeEntry('toRemove'));
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].id).toBe('keep');
  });

  it('clears all entries', () => {
    const { result } = renderHook(() => useHistory());
    act(() => result.current.addEntry(makeResult('a')));
    act(() => result.current.addEntry(makeResult('b')));
    act(() => result.current.clearHistory());
    expect(result.current.entries).toHaveLength(0);
  });

  it('persists entries to localStorage', () => {
    const { result } = renderHook(() => useHistory());
    act(() => result.current.addEntry(makeResult('persist')));
    const stored = JSON.parse(localStorage.getItem('efectos-ia-history') ?? '[]');
    expect(stored[0].id).toBe('persist');
  });
});
