import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockAnalyze } from '@/api/mock';

// Speed up the artificial delays inside mockAnalyze
beforeEach(() => { vi.useFakeTimers(); });
afterEach(()  => { vi.useRealTimers(); });

function makeFile(name: string, size = 2048): File {
  return new File([new Uint8Array(size)], name, { type: 'audio/wav' });
}

async function fastMock(file: File) {
  const promise = mockAnalyze(file);
  // advance past both delay() calls (1000 ms + 1500 ms)
  await vi.runAllTimersAsync();
  return promise;
}

describe('mockAnalyze', () => {
  it('returns a valid AnalysisResult shape', async () => {
    const result = await fastMock(makeFile('test.wav'));
    expect(result).toMatchObject({
      filename:   'test.wav',
      confidence: expect.any(Number),
      effect:     expect.stringMatching(/^(distortion|overdrive|clean|fuzz)$/),
    });
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('result includes all DSP features', async () => {
    const result = await fastMock(makeFile('guitar.mp3'));
    const keys = [
      'rms_db','centroid','bandwidth','flatness',
      'zcr','hp_ratio','onset_count','reverb_ratio',
    ] as const;
    keys.forEach((k) => expect(typeof result.features[k]).toBe('number'));
  });

  it('result includes all pedal parameters in 0-100 range', async () => {
    const result = await fastMock(makeFile('guitar.wav'));
    (['gain','tone','bass','mid','treble','reverb'] as const).forEach((k) => {
      expect(result.parameters[k]).toBeGreaterThanOrEqual(0);
      expect(result.parameters[k]).toBeLessThanOrEqual(100);
    });
  });

  it('is deterministic — same filename gives same effect', async () => {
    const a = await fastMock(makeFile('consistent.wav', 1024));
    const b = await fastMock(makeFile('consistent.wav', 1024));
    expect(a.effect).toBe(b.effect);
    expect(a.parameters.gain).toBe(b.parameters.gain);
  });

  it('different filenames produce valid effects', async () => {
    const a = await fastMock(makeFile('fileA.wav', 512));
    const b = await fastMock(makeFile('fileB.wav', 512));
    const valid = ['distortion', 'overdrive', 'clean', 'fuzz'];
    expect(valid).toContain(a.effect);
    expect(valid).toContain(b.effect);
  });
});
