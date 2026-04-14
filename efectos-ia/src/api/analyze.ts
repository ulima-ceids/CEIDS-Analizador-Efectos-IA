import { apiClient } from './client';
import { mockAnalyze } from './mock';
import { analysisResponseSchema } from '@/schemas/analysis';
import type { AnalysisResult } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export async function analyzeAudio(file: File): Promise<AnalysisResult> {
  if (USE_MOCK) {
    return mockAnalyze(file);
  }

  const form = new FormData();
  form.append('file', file);

  const { data } = await apiClient.post('/analyze', form);

  const parsed = analysisResponseSchema.safeParse({
    ...data,
    filename:    data.filename    ?? file.name,
    id:          data.id          ?? crypto.randomUUID(),
    analyzed_at: data.analyzed_at ?? new Date().toISOString(),
  });

  if (!parsed.success) {
    throw new Error('Respuesta del servidor con formato inesperado.');
  }

  return parsed.data as AnalysisResult;
}
