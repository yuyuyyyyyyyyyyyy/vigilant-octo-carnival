'use client';

import { AnalysisResult } from './types';

export interface HistoryEntry {
  id: string;
  input: string;
  result: AnalysisResult;
  createdAt: string;
}

const KEY = 'prism-history';

function isResultLike(value: any): value is AnalysisResult {
  return value && typeof value === 'object' && Array.isArray(value.models);
}

function normalizeEntry(item: any, index: number): HistoryEntry | null {
  if (!item || typeof item !== 'object') return null;

  const result = isResultLike(item.result) ? item.result : isResultLike(item) ? item : null;
  if (!result) return null;

  return {
    id: String(item.id || `${Date.now().toString(36)}-${index}`),
    input: String(item.input || item.event_summary || item.event_reconstruction || '未命名事件'),
    result,
    createdAt: String(item.createdAt || item.created_at || result.created_at || new Date().toISOString()),
  };
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item, index) => normalizeEntry(item, index))
      .filter((item): item is HistoryEntry => Boolean(item));
  } catch {
    return [];
  }
}

export function saveEntry(input: string, result: AnalysisResult): HistoryEntry {
  const entry: HistoryEntry = {
    id: Date.now().toString(36),
    input,
    result,
    createdAt: new Date().toISOString(),
  };
  const history = getHistory();
  history.unshift(entry);
  if (history.length > 50) history.length = 50;
  localStorage.setItem(KEY, JSON.stringify(history));
  return entry;
}

export function deleteEntry(id: string): void {
  const history = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(history));
}
