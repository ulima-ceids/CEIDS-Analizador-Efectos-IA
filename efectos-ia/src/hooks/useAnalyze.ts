import { useMutation } from '@tanstack/react-query';
import { analyzeAudio } from '@/api/analyze';
import type { AnalysisResult } from '@/types';

export function useAnalyze() {
  return useMutation<AnalysisResult, Error, File>({
    mutationFn: analyzeAudio,
    retry: 0,
  });
}
