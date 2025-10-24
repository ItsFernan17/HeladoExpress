// app/pedidos/page.tsx
'use client';

import { useEffect, useMemo } from 'react';
import PedidoCard from '@/components/PedidoCard';
import { usePedidos } from '@/hooks/usePedido';
import { useEstados } from '@/hooks/useEstado';
import { usePedidoEstado } from '@/hooks/usePedidoEstado';
import { GiIceCreamCone } from 'react-icons/gi';
import { FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';

export default function PedidosPage() {
  const { list, setList, loading, error, refetch } = usePedidos();
  const { data: estados } = useEstados();
  const { cambiar, loading: patching } = usePedidoEstado();

  // Refresco inteligente: más frecuente cuando hay pedidos, menos cuando no hay
  useEffect(() => {
    const hasOrders = list && list.length > 0;
    const interval = hasOrders ? 3000 : 10000; // 3s con pedidos, 10s sin pedidos
    
    const t = setInterval(refetch, interval);
    return () => clearInterval(t);
  }, [refetch, list?.length]);

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

  if (loading && !list) {
    return (
      <main className="bg-gray-200 min-h-screen">
        <div className="mx-auto max-w-[980px] px-3 sm:px-5 pt-20 pb-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
              <div className="mb-6">
                <FiRefreshCw size={48} className="mx-auto text-blue-500 animate-spin mb-4" />
                <GiIceCreamCone size={40} className="mx-auto text-amber-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Verificando pedidos...
              </h2>
              
              <p className="text-gray-600 text-base">
                Conectando con el sistema
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }
  if (error) {
    return (
      <main className="bg-gray-200 min-h-screen">
        <div className="mx-auto max-w-[980px] px-3 sm:px-5 pt-20 pb-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
              <div className="mb-6">
                <FiX size={64} className="mx-auto text-red-500 mb-4" />
                <GiIceCreamCone size={48} className="mx-auto text-amber-500 opacity-50" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Error al cargar pedidos
              </h2>
              
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                No se pudieron cargar los pedidos en este momento.
                <br />
                <span className="text-red-600 font-medium">Reintentando automáticamente...</span>
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">
                  <FiRefreshCw className="inline mr-2" size={16} />
                  Reintentando automáticamente cada 10 segundos
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
  if (!list) return null;

  // Estado cuando no hay pedidos
  if (list.length === 0) {
    return (
      <main className="bg-gray-200 min-h-screen">
        <div className="mx-auto max-w-[980px] px-3 sm:px-5 pt-20 pb-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                ¡Todo al día! 🎉
              </h2>
              
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                No hay pedidos pendientes en este momento. 
                <br />
                <span className="text-amber-600 font-medium">¡Excelente trabajo!</span>
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-700 text-sm">
                  <FiRefreshCw className="inline mr-2" size={16} />
                  Monitoreando nuevos pedidos automáticamente cada 10 segundos
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

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
        {/* Encabezado con contador de pedidos */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 inline-block">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Pedidos Activos
            </h1>
            <div className="flex items-center justify-center gap-2">
              <GiIceCreamCone className="text-amber-500" size={24} />
              <span className="text-lg font-semibold text-blue-600">
                {list.length} {list.length === 1 ? 'pedido' : 'pedidos'} pendientes
              </span>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              <FiRefreshCw className="inline mr-1" size={14} />
              Actualizando cada 3 segundos
            </div>
          </div>
        </div>

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
