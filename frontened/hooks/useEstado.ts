'use client';

import { useEffect, useMemo, useState } from 'react';
import { getEstados } from '@/services/estado.service';
import type { Estado } from '@/types/estado';

export function useEstados() {
  const [data, setData] = useState<Estado[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    getEstados(c.signal)
      .then(setData)
      .catch((e) => setError(e as Error))
      .finally(() => setLoading(false));
    return () => c.abort();
  }, []);

  // Mapa útil: id → nombre
  const mapById = useMemo(() => {
    const m = new Map<number, string>();
    (data ?? []).forEach((e) => m.set(e.id, e.nombre));
    return m;
  }, [data]);

  return { data, loading, error, mapById };
}
