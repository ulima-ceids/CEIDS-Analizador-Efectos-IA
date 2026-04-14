import type { AnalysisResult } from '@/types';

// Simulates backend processing delay
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Deterministic pseudo-random based on filename
function seedRandom(seed: string): () => number {
  let s = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

export async function mockAnalyze(file: File): Promise<AnalysisResult> {
  // Simulate upload + processing time
  await delay(1000);   // "uploading"
  await delay(1500);   // "analyzing"

  const rand = seedRandom(file.name + file.size);

  const isDistortion = rand() > 0.45;
  const confidence   = 0.62 + rand() * 0.33;

  const rms_db       = -(12 + rand() * 24);
  const centroid     = 1800 + rand() * 4000;
  const bandwidth    = 1200 + rand() * 2800;
  const flatness     = isDistortion ? 0.3 + rand() * 0.4 : 0.05 + rand() * 0.25;
  const zcr          = isDistortion ? 120 + rand() * 200 : 30 + rand() * 80;
  const hp_ratio     = 0.3 + rand() * 0.6;
  const onset_count  = Math.round(4 + rand() * 24);
  const reverb_ratio = 0.05 + rand() * 0.4;

  const gain    = clamp(isDistortion ? 55 + rand() * 40 : 20 + rand() * 45);
  const tone    = clamp(30 + rand() * 50);
  const bass    = clamp(30 + rand() * 50);
  const mid     = clamp(isDistortion ? 45 + rand() * 40 : 30 + rand() * 55);
  const treble  = clamp(isDistortion ? 50 + rand() * 40 : 25 + rand() * 50);
  const reverb  = clamp(reverb_ratio * 100);

  return {
    id:          crypto.randomUUID(),
    filename:    file.name,
    duration_s:  Math.round((2 + rand() * 12) * 10) / 10,
    effect:      isDistortion ? 'distortion' : 'overdrive',
    confidence:  Math.round(confidence * 100) / 100,
    parameters:  {
      gain:   Math.round(gain),
      tone:   Math.round(tone),
      bass:   Math.round(bass),
      mid:    Math.round(mid),
      treble: Math.round(treble),
      reverb: Math.round(reverb),
    },
    features: {
      rms_db:       Math.round(rms_db * 10) / 10,
      centroid:     Math.round(centroid),
      bandwidth:    Math.round(bandwidth),
      flatness:     Math.round(flatness * 1000) / 1000,
      zcr:          Math.round(zcr),
      hp_ratio:     Math.round(hp_ratio * 100) / 100,
      onset_count:  onset_count,
      reverb_ratio: Math.round(reverb_ratio * 100) / 100,
    },
    analyzed_at: new Date().toISOString(),
  };
}
