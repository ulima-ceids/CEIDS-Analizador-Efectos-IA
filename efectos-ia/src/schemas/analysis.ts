import { z } from 'zod';

// ── File validation ──────────────────────────────────────────
export const ACCEPTED_AUDIO_TYPES = [
  'audio/wav',
  'audio/wave',
  'audio/mpeg',
  'audio/mp3',
  'audio/ogg',
  'audio/flac',
  'audio/x-flac',
  'audio/aiff',
  'audio/x-aiff',
];

export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const audioFileSchema = z.object({
  file: z
    .instanceof(File, { message: 'Debes seleccionar un archivo de audio' })
    .refine(
      (f) => ACCEPTED_AUDIO_TYPES.includes(f.type) || /\.(wav|mp3|ogg|flac|aiff?)$/i.test(f.name),
      { message: 'Formato no soportado. Usa WAV, MP3, OGG, FLAC o AIFF.' }
    )
    .refine(
      (f) => f.size <= MAX_FILE_SIZE_BYTES,
      { message: `El archivo no puede superar los ${MAX_FILE_SIZE_MB} MB.` }
    )
    .refine(
      (f) => f.size > 0,
      { message: 'El archivo está vacío.' }
    ),
});

export type AudioFileInput = z.infer<typeof audioFileSchema>;

// ── DSP Features response schema ─────────────────────────────
export const dspFeaturesSchema = z.object({
  rms_db:       z.number(),
  centroid:     z.number(),
  bandwidth:    z.number(),
  flatness:     z.number().min(0).max(1),
  zcr:          z.number().min(0),
  hp_ratio:     z.number().min(0).max(1),
  onset_count:  z.number().int().min(0),
  reverb_ratio: z.number().min(0).max(1),
});

// ── Effect parameters schema ─────────────────────────────────
export const effectParametersSchema = z.object({
  gain:   z.number().min(0).max(100),
  tone:   z.number().min(0).max(100),
  bass:   z.number().min(0).max(100),
  mid:    z.number().min(0).max(100),
  treble: z.number().min(0).max(100),
  reverb: z.number().min(0).max(100),
});

// ── Full analysis response ───────────────────────────────────
export const analysisResponseSchema = z.object({
  id:          z.string().optional().default(() => crypto.randomUUID()),
  filename:    z.string().optional().default('audio'),
  duration_s:  z.number().optional().default(0),
  effect:      z.enum(['distortion', 'overdrive', 'clean', 'fuzz']),
  confidence:  z.number().min(0).max(1),
  parameters:  effectParametersSchema,
  features:    dspFeaturesSchema,
  analyzed_at: z.string().optional().default(() => new Date().toISOString()),
});

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
