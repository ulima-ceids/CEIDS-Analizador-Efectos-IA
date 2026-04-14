export type EffectType = 'distortion' | 'overdrive' | 'clean' | 'fuzz';

export interface DSPFeatures {
  rms_db:       number;
  centroid:     number;
  bandwidth:    number;
  flatness:     number;
  zcr:          number;
  hp_ratio:     number;
  onset_count:  number;
  reverb_ratio: number;
}

export interface EffectParameters {
  gain:    number;
  tone:    number;
  bass:    number;
  mid:     number;
  treble:  number;
  reverb:  number;
}

export interface AnalysisResult {
  id:          string;
  filename:    string;
  duration_s:  number;
  effect:      EffectType;
  confidence:  number;
  parameters:  EffectParameters;
  features:    DSPFeatures;
  analyzed_at: string;
}

export type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'success' | 'error';

export interface HistoryEntry {
  id:          string;
  filename:    string;
  effect:      EffectType;
  confidence:  number;
  analyzed_at: string;
  result:      AnalysisResult;
}
