'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPedidosCompletos } from '@/services/pedido.service';
import type { PedidoCompleto } from '@/types/pedido';

export function usePedidos() {
  const [list, setList] = useState<PedidoCompleto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

const refetch = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await getPedidosCompletos();

    const normalized: PedidoCompleto[] = res.map((p: any, idx: number) => {
      // intenta sacar el id numérico de "#P0001" -> 1
      const n = Number(String(p.pedido ?? '').replace(/\D/g, ''));
      const parsedId = Number.isNaN(n) ? undefined : n; // si no se puede, queda undefined

      const id: number =
        (p.id as number | undefined) ??
        (p.pedidoId as number | undefined) ??
        parsedId ?? // solo entra si es número válido
        idx + 1;    // último recurso (solo para que no se caiga la UI)

      return { ...p, id };
    });

    setList(normalized);
  } catch (e) {
    setError(e as Error);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { list, setList, loading, error, refetch };
}