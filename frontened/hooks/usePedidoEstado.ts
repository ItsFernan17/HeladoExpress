'use client';

import { useCallback, useState } from 'react';
import { patchPedidoEstado } from '@/services/pedido.service';
import type { PedidoCompleto } from '@/types/pedido';

interface Params {
  pedidoId: number;
  estadoId: number;
  estadoNombre: string; // tomado del catálogo de estados
  current?: { list: PedidoCompleto[]; setList: (l: PedidoCompleto[]) => void }; // para optimistic update
  onSuccess?: () => void;
}

export function usePedidoEstado() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cambiar = useCallback(async ({ pedidoId, estadoId, estadoNombre, current, onSuccess }: Params) => {
    setLoading(true); setError(null);
    const backup = current ? [...current.list] : null;

    try {
      if (current) {
        // Optimistic update
        current.setList(
          current.list.map((p) => (p.id === pedidoId ? { ...p, estado: estadoNombre } : p))
        );
      }

      await patchPedidoEstado(pedidoId, estadoId);
      onSuccess?.();
    } catch (e) {
      if (backup && current) current.setList(backup); // rollback
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { cambiar, loading, error };
}
