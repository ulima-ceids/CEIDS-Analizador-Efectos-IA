import { useState, useCallback } from 'react';
import type { HistoryEntry, AnalysisResult } from '@/types';

const STORAGE_KEY = 'efectos-ia-history';
const MAX_ENTRIES = 20;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage quota exceeded — silently ignore
  }
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory);

  const addEntry = useCallback((result: AnalysisResult) => {
    const entry: HistoryEntry = {
      id:          result.id,
      filename:    result.filename,
      effect:      result.effect,
      confidence:  result.confidence,
      analyzed_at: result.analyzed_at,
      result,
    };
    setEntries((prev) => {
      const next = [entry, ...prev.filter((e) => e.id !== entry.id)].slice(0, MAX_ENTRIES);
      saveHistory(next);
      return next;
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  }, []);

  return { entries, addEntry, removeEntry, clearHistory };
}
