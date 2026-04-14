import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  formatDuration,
  effectLabel,
  effectColor,
  confidenceLabel,
  cn,
} from '@/utils';

describe('formatFileSize', () => {
  it('formats bytes', ()        => expect(formatFileSize(512)).toBe('512 B'));
  it('formats kilobytes', ()    => expect(formatFileSize(2048)).toBe('2.0 KB'));
  it('formats megabytes', ()    => expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB'));
});

describe('formatDuration', () => {
  it('formats seconds under a minute', () => expect(formatDuration(45)).toBe('0:45'));
  it('formats minutes and seconds',    () => expect(formatDuration(125)).toBe('2:05'));
  it('pads single-digit seconds',      () => expect(formatDuration(61)).toBe('1:01'));
  it('handles zero',                   () => expect(formatDuration(0)).toBe('0:00'));
});

describe('effectLabel', () => {
  it('returns Distortion for distortion', () => expect(effectLabel('distortion')).toBe('Distortion'));
  it('returns Overdrive for overdrive',   () => expect(effectLabel('overdrive')).toBe('Overdrive'));
  it('returns Clean for clean',           () => expect(effectLabel('clean')).toBe('Clean'));
  it('returns Fuzz for fuzz',             () => expect(effectLabel('fuzz')).toBe('Fuzz'));
});

describe('effectColor', () => {
  it('amber for distortion', () => expect(effectColor('distortion')).toBe('amber'));
  it('cyan for overdrive',   () => expect(effectColor('overdrive')).toBe('cyan'));
  it('green for clean',      () => expect(effectColor('clean')).toBe('green'));
  it('red for fuzz',         () => expect(effectColor('fuzz')).toBe('red'));
});

describe('confidenceLabel', () => {
  it('Alta at 0.90',  () => expect(confidenceLabel(0.90)).toBe('Alta'));
  it('Media at 0.70', () => expect(confidenceLabel(0.70)).toBe('Media'));
  it('Baja at 0.50',  () => expect(confidenceLabel(0.50)).toBe('Baja'));
});

describe('cn', () => {
  it('joins class names',          () => expect(cn('a', 'b')).toBe('a b'));
  it('filters falsy values',       () => expect(cn('a', false, null, undefined, 'b')).toBe('a b'));
  it('returns empty for all falsy',() => expect(cn(false, null)).toBe(''));
});
