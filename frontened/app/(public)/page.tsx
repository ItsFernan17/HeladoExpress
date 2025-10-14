// app/pedidos/page.tsx
'use client';

import { useEffect, useMemo } from 'react';
import PedidoCard from '@/components/PedidoCard';
import { usePedidos } from '@/hooks/usePedido';
import { useEstados } from '@/hooks/useEstado';
import { usePedidoEstado } from '@/hooks/usePedidoEstado';

export default function PedidosPage() {
  const { list, setList, loading, error, refetch } = usePedidos();
  const { data: estados } = useEstados();
  const { cambiar, loading: patching } = usePedidoEstado();

  useEffect(() => {
    const t = setInterval(refetch, 3000);
    return () => clearInterval(t);
  }, [refetch]);

  // Balanceo simple por cantidad de items
  const { left, right } = useMemo(() => {
    const L: typeof list = [];
    const R: typeof list = [];
    let wL = 0, wR = 0;
    (list ?? []).forEach((p) => {
      const weight = 3 + (p.items?.length ?? 0) * 2;
      if (wL <= wR) { L.push(p); wL += weight; } else { R.push(p); wR += weight; }
    });
    return { left: L, right: R };
  }, [list]);

  if (loading && !list) return <main className="p-6">Cargando…</main>;
  if (error) return <main className="p-6">Error: {error.message}</main>;
  if (!list) return null;

  // --------------------------
  // ESPACIADO ENTRE TARJETAS
  // --------------------------
  // badgeText = 25px, padding vertical ~8px => altura ~41px
  // el badge sube con -top-4 (16px), dejamos margen extra cómodo.
  const BASE_GAP_PX = 18;         // separación mínima deseada
  const BADGE_OVERFLOW_PX = 16;   // coincide con -top-4
  const EXTRA_CLEARANCE_PX = 10;  // respiro extra
  const STACK_SPACING = BASE_GAP_PX + BADGE_OVERFLOW_PX + EXTRA_CLEARANCE_PX; // ≈44px

  return (
    <main className="bg-gray-200">
      <div className="mx-auto max-w-[980px] px-3 sm:px-5 pt-20 pb-6">
        {/* 2 columnas fijas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 items-start">
          {/* Columna izquierda */}
          <div className="flex flex-col">
            {left?.map((p, idx) => (
              <div
                key={String(p.id ?? p.pedido)}
                // margen superior calculado por tarjeta
                style={{ marginTop: idx === 0 ? 0 : STACK_SPACING }}
              >
                <PedidoCard
                  pedido={p}
                  estados={estados}
                  disabled={patching}
                  onAdvance={(next) =>
                    cambiar({
                      pedidoId: p.id,
                      estadoId: next.id,
                      estadoNombre: next.nombre,
                      current: { list: list!, setList },
                      onSuccess: refetch,
                    })
                  }
                />
              </div>
            ))}
          </div>

          {/* Columna derecha */}
          <div className="flex flex-col">
            {right?.map((p, idx) => (
              <div
                key={String(p.id ?? p.pedido)}
                style={{ marginTop: idx === 0 ? 0 : STACK_SPACING }}
              >
                <PedidoCard
                  pedido={p}
                  estados={estados}
                  disabled={patching}
                  onAdvance={(next) =>
                    cambiar({
                      pedidoId: p.id,
                      estadoId: next.id,
                      estadoNombre: next.nombre,
                      current: { list: list!, setList },
                      onSuccess: refetch,
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
