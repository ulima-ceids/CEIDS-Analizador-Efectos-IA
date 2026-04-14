import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryPanel } from '@/components/HistoryPanel';
import type { HistoryEntry } from '@/types';

const makeEntry = (id: string, effect: 'distortion' | 'overdrive' = 'distortion'): HistoryEntry => ({
  id,
  filename:    `${id}.wav`,
  effect,
  confidence:  0.85,
  analyzed_at: new Date().toISOString(),
  result: {
    id,
    filename:    `${id}.wav`,
    duration_s:  4.2,
    effect,
    confidence:  0.85,
    parameters:  { gain: 70, tone: 50, bass: 45, mid: 55, treble: 60, reverb: 20 },
    features: {
      rms_db: -18, centroid: 3200, bandwidth: 2400, flatness: 0.35,
      zcr: 180, hp_ratio: 0.6, onset_count: 12, reverb_ratio: 0.2,
    },
    analyzed_at: new Date().toISOString(),
  },
});

describe('HistoryPanel', () => {
  it('shows empty state when no entries', () => {
    render(
      <HistoryPanel
        entries={[]}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );
    expect(screen.getByText(/sin historial/i)).toBeInTheDocument();
  });

  it('renders entry filenames', () => {
    const entries = [makeEntry('solo'), makeEntry('riff')];
    render(
      <HistoryPanel
        entries={entries}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );
    expect(screen.getByText('solo.wav')).toBeInTheDocument();
    expect(screen.getByText('riff.wav')).toBeInTheDocument();
  });

  it('calls onSelect when clicking an entry', () => {
    const onSelect = vi.fn();
    const entry    = makeEntry('track');
    render(
      <HistoryPanel
        entries={[entry]}
        onSelect={onSelect}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('track.wav'));
    expect(onSelect).toHaveBeenCalledWith(entry);
  });

  it('shows the entry count badge', () => {
    const entries = [makeEntry('a'), makeEntry('b'), makeEntry('c')];
    render(
      <HistoryPanel
        entries={entries}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
