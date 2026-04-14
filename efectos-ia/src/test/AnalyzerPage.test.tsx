import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnalyzerPage } from '@/features/analyzer/AnalyzerPage';

// ── Mock heavy / platform-dependent components ───────────────
vi.mock('@/components/WaveformPlayer', () => ({
  WaveformPlayer: ({ file }: { file: File }) => (
    <div data-testid="waveform-player">{file.name}</div>
  ),
}));

// Recharts ResponsiveContainer uses ResizeObserver — swap entire chart for a stub
vi.mock('@/components/DSPMetrics', () => ({
  DSPMetrics: () => <div data-testid="dsp-metrics" />,
}));

// analyzeAudio resolves immediately
vi.mock('@/api/analyze', () => ({
  analyzeAudio: vi.fn().mockResolvedValue({
    id:          'mock-result-id',
    filename:    'test.wav',
    duration_s:  5.2,
    effect:      'distortion',
    confidence:  0.88,
    parameters:  { gain: 72, tone: 48, bass: 40, mid: 58, treble: 65, reverb: 18 },
    features: {
      rms_db: -16, centroid: 3500, bandwidth: 2600, flatness: 0.38,
      zcr: 195, hp_ratio: 0.62, onset_count: 14, reverb_ratio: 0.18,
    },
    analyzed_at: '2025-01-01T12:00:00.000Z',
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

function selectFile(name = 'riff.wav') {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  const file  = new File([new Uint8Array(2048)], name, { type: 'audio/wav' });
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  fireEvent.change(input);
  return file;
}

describe('AnalyzerPage integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => { vi.useRealTimers(); });

  it('renders the hero headline', () => {
    render(<AnalyzerPage />, { wrapper });
    expect(screen.getByText(/detecta el/i)).toBeInTheDocument();
  });

  it('renders the audio uploader drop zone', () => {
    render(<AnalyzerPage />, { wrapper });
    expect(screen.getByText(/arrastra tu archivo/i)).toBeInTheDocument();
  });

  it('shows the waveform player after selecting a file', async () => {
    render(<AnalyzerPage />, { wrapper });
    selectFile('song.wav');
    await waitFor(() => {
      expect(screen.getByTestId('waveform-player')).toBeInTheDocument();
    });
  });

  it('shows the Analizar button after a file is selected', async () => {
    render(<AnalyzerPage />, { wrapper });
    selectFile();
    await waitFor(() => {
      expect(screen.getByText(/analizar audio/i)).toBeInTheDocument();
    });
  });

  it('shows analysis results after clicking Analizar', async () => {
    render(<AnalyzerPage />, { wrapper });
    selectFile();

    const btn = await screen.findByText(/analizar audio/i);

    await act(async () => {
      fireEvent.click(btn);
      // advance past the 900 ms "upload" delay in handleAnalyze
      await vi.advanceTimersByTimeAsync(2000);
    });

    await waitFor(
      () => expect(screen.getByText('Distortion')).toBeInTheDocument(),
      { timeout: 8000 }
    );
    expect(screen.getByText('88')).toBeInTheDocument();
  });

  it('saves result to localStorage after analysis', async () => {
    render(<AnalyzerPage />, { wrapper });
    selectFile('histtest.wav');

    const btn = await screen.findByText(/analizar audio/i);

    await act(async () => {
      fireEvent.click(btn);
      await vi.advanceTimersByTimeAsync(2000);
    });

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('efectos-ia-history') ?? '[]');
      expect(stored.length).toBeGreaterThan(0);
    }, { timeout: 8000 });
  });
});
