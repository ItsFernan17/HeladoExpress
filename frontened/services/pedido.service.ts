
import { http } from '@/lib/http';
import type { PedidoCompleto } from '@/types/pedido';

export function getPedidosCompletos(signal?: AbortSignal) {
  return http<PedidoCompleto[]>('/pedido/completos/todos', { method: 'GET', signal });
}

export function patchPedidoEstado(pedidoId: number, estadoId: number, signal?: AbortSignal) {
  if (pedidoId == null || Number.isNaN(Number(pedidoId))) {
    throw new Error(`pedidoId inválido en patchPedidoEstado: ${pedidoId}`);
  }
  if (estadoId == null || Number.isNaN(Number(estadoId))) {
    throw new Error(`estadoId inválido en patchPedidoEstado: ${estadoId}`);
  }

  const path = `/pedido/${pedidoId}/estado/${estadoId}`;
  // Guardia extra por si acaso
  if (path.includes('undefined')) {
    throw new Error(`Ruta mal formada: ${path}`);
  }

  return http<{ success: boolean }>(path, { method: 'PATCH', signal });
}
