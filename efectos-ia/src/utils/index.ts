import type { EffectType } from '@/types';

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day:    '2-digit',
    month:  'short',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function effectLabel(effect: EffectType): string {
  const map: Record<EffectType, string> = {
    distortion: 'Distortion',
    overdrive:  'Overdrive',
    clean:      'Clean',
    fuzz:       'Fuzz',
  };
  return map[effect] ?? effect;
}

export function effectColor(effect: EffectType): 'amber' | 'cyan' | 'green' | 'red' {
  const map: Record<EffectType, 'amber' | 'cyan' | 'green' | 'red'> = {
    distortion: 'amber',
    overdrive:  'cyan',
    clean:      'green',
    fuzz:       'red',
  };
  return map[effect] ?? 'amber';
}

export function confidenceLabel(c: number): string {
  if (c >= 0.85) return 'Alta';
  if (c >= 0.65) return 'Media';
  return 'Baja';
}

export function exportResultAsJSON(result: object, filename = 'analisis'): void {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
