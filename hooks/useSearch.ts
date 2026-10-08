'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchSearch, type SearchKind, type SearchResult } from '@/lib/search';

type Resource = { key: string; rows: SearchResult[]; total: number; error: boolean; morePending: boolean; moreError: boolean };

function useSearchSource(kind: SearchKind, query: string, enabled: boolean) {
  const [attempt, setAttempt] = useState(0);
  const [resource, setResource] = useState<Resource | null>(null);
  const moreRequest = useRef<AbortController | null>(null);
  const key = JSON.stringify([query, attempt]);
  const activeKey = useRef(key);
  useEffect(() => {
    activeKey.current = key;
    moreRequest.current?.abort();
    if (!enabled) return;
    const controller = new AbortController();
    let cancelled = false;
    const debounce = setTimeout(() => {
      const timeout = setTimeout(() => controller.abort(), 10000);
      fetchSearch(kind, query, controller.signal).then(rows => {
        if (!cancelled) setResource({ key, rows, total: Number(rows[0]?.total_count ?? 0), error: false, morePending: false, moreError: false });
      }).catch(() => {
        if (!cancelled) setResource({ key, rows: [], total: 0, error: true, morePending: false, moreError: false });
      }).finally(() => clearTimeout(timeout));
    }, query ? 300 : 0);
    return () => { cancelled = true; clearTimeout(debounce); controller.abort(); moreRequest.current?.abort(); };
  }, [enabled, key, kind, query]);

  const current = enabled && resource?.key === key ? resource : null;
  const retry = () => setAttempt(value => value + 1);
  const loadMore = async () => {
    if (!current || current.error || current.morePending || current.rows.length >= current.total) return;
    const controller = new AbortController();
    moreRequest.current = controller;
    setResource(previous => previous?.key === key ? { ...previous, morePending: true, moreError: false } : previous);
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const rows = await fetchSearch(kind, query, controller.signal, current.rows.length);
      if (activeKey.current !== key) return;
      setResource(previous => {
        if (previous?.key !== key) return previous;
        const merged = [...new Map([...previous.rows, ...rows].map(row => [row.id, row])).values()];
        return { ...previous, rows: merged,
          // A changed data set or capped offset must not leave an endless "Ver mais" button.
          total: merged.length > previous.rows.length ? Number(rows[0].total_count) : previous.rows.length,
          morePending: false, moreError: false };
      });
    } catch {
      if (activeKey.current === key) setResource(previous => previous?.key === key ? { ...previous, morePending: false, moreError: true } : previous);
    } finally { clearTimeout(timeout); }
  };
  return { rows: current?.rows ?? [], total: current?.total ?? 0, pending: enabled && !current,
    error: Boolean(current?.error), morePending: Boolean(current?.morePending), moreError: Boolean(current?.moreError), retry, loadMore };
}

export function useSearch(query: string) {
  const clean = query.trim().slice(0, 120);
  return { Club: useSearchSource('Club', clean, true), Player: useSearchSource('Player', clean, Boolean(clean)), News: useSearchSource('News', clean, Boolean(clean)) };
}
