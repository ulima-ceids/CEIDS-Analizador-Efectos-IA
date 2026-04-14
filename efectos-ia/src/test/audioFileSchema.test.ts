import { describe, it, expect } from 'vitest';
import { audioFileSchema, MAX_FILE_SIZE_BYTES } from '@/schemas/analysis';

function makeFile(name: string, type: string, size = 1024): File {
  const buf = new Uint8Array(size);
  return new File([buf], name, { type });
}

describe('audioFileSchema', () => {
  it('accepts a valid WAV file', () => {
    const file = makeFile('riff.wav', 'audio/wav');
    const result = audioFileSchema.safeParse({ file });
    expect(result.success).toBe(true);
  });

  it('accepts a valid MP3 file', () => {
    const file = makeFile('solo.mp3', 'audio/mpeg');
    const result = audioFileSchema.safeParse({ file });
    expect(result.success).toBe(true);
  });

  it('rejects an oversized file', () => {
    const file = makeFile('huge.wav', 'audio/wav', MAX_FILE_SIZE_BYTES + 1);
    const result = audioFileSchema.safeParse({ file });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0]?.message).toMatch(/50 MB/);
  });

  it('rejects a non-audio file', () => {
    const file = makeFile('doc.pdf', 'application/pdf');
    const result = audioFileSchema.safeParse({ file });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0]?.message).toMatch(/Formato no soportado/);
  });

  it('rejects an empty file', () => {
    const file = makeFile('empty.wav', 'audio/wav', 0);
    const result = audioFileSchema.safeParse({ file });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0]?.message).toMatch(/vacío/);
  });

  it('accepts by extension when MIME is generic', () => {
    const file = makeFile('track.flac', 'application/octet-stream');
    const result = audioFileSchema.safeParse({ file });
    expect(result.success).toBe(true);
  });
});
