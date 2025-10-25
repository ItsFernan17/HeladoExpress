// components/PedidoCard.tsx
'use client';

import { Paytone_One, Poppins } from 'next/font/google';
import type { PedidoCompleto, PedidoItem } from '@/types/pedido';

const paytone = Paytone_One({ subsets: ['latin'], weight: '400', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600'], display: 'swap' });

const COLORS = {
  textRed: '#E91E63',
  btnRed:  '#EB0B2A',
  nuevo:   '#1976D2',
  preparando: '#FB8C00',
  entregado:  '#2E7D32',
  itemTitle:  '#3C3B3B',
};

const SIZES = { title: 18, total: 20, itemTitle: 16, body: 14, badgeText: 18, icon: 20 };

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const estadoBg = (estado: string) =>
  norm(estado).includes('nuevo') ? COLORS.nuevo :
  norm(estado).includes('prepar') ? COLORS.preparando :
  (norm(estado).includes('finaliz') || norm(estado).includes('entreg')) ? COLORS.entregado :
  '#9CA3AF';

function EstadoIcon({ estado, size }: { estado: string; size: number }) {
  const color = '#fff'; const e = norm(estado);
  if (e.includes('nuevo')) return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="mr-1.5">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
      <path d="M12 7 v5 l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>);
  if (e.includes('prepar')) return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="mr-1.5">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" opacity="0.35" fill="none" />
      <path d="M12 3 a9 9 0 0 1 9 9" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="mr-1.5">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
      <path d="M8.5 12.5 l2.5 2.5 l4.5-4.5" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>);
}

type Estado = { id: number; nombre: string };
const ORDER = [1, 2, 3] as const;
const getNextEstado = (actual: string, estados?: Estado[] | null): Estado | null => {
  if (!estados?.length) return null;
  const cur = estados.find(e => norm(e.nombre) === norm(actual));
  if (!cur) return null;
  const idx = ORDER.indexOf(cur.id as (typeof ORDER)[number]);
  if (idx === -1 || idx === ORDER.length - 1) return null;
  const nextId = ORDER[idx + 1];
  return estados.find(e => e.id === nextId) ?? null;
};

type Props = {
  pedido: PedidoCompleto;
  estados?: Estado[] | null;
  onAdvance?: (next: Estado) => void;
  disabled?: boolean;
  className?: string;                // ← nuevo
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="leading-5" style={{ fontSize: SIZES.body }}>
    <span className={`font-semibold ${poppins.className}`}>{label}: </span>
    <span className={poppins.className}>{children}</span>
  </div>
);

export default function PedidoCard({ pedido, estados, onAdvance, disabled, className }: Props) {
  const next = getNextEstado(pedido.estado, estados);
  const badgeColor = estadoBg(pedido.estado);

  return (
    <article
      className={`relative rounded-2xl bg-white shadow-md border border-gray-200 p-4 sm:p-5
                  flex flex-col ${className ?? ''}`}   // ← flex column + h-full desde prop
    >
      {/* Badge de estado compacto */}
      <div
        className="absolute -top-4 right-4 rounded-full text-white shadow flex items-center ring-1 ring-white/70"
        style={{ backgroundColor: badgeColor, fontFamily: paytone.style.fontFamily, padding: '6px 10px', fontSize: SIZES.badgeText }}
      >
        <EstadoIcon estado={pedido.estado} size={SIZES.icon} />
        <span className="pt-[1px]">{pedido.estado}</span>
      </div>

      {/* Título */}
      <h2 className="mb-2" style={{ color: COLORS.textRed, fontFamily: paytone.style.fontFamily, fontSize: SIZES.title }}>
        Pedido {pedido.pedido}
      </h2>

      {/* Contenido (ocupa el espacio disponible arriba) */}
      <div className="space-y-3">
        {pedido.items.map((it: PedidoItem, idx: number) => (
          <div key={`${pedido.pedido}-${it.nombre}-${idx}`} className="mt-1">
            <div className="mb-1" style={{ fontFamily: paytone.style.fontFamily, color: COLORS.itemTitle, fontSize: SIZES.itemTitle }}>
              Item No. {idx + 1}
            </div>
            <div className="pl-4 sm:pl-6 border-l-4 border-gray-100 space-y-1">
              <Row label="Tipo">{it.tipo}</Row>
              <Row label="Nombre">{it.nombre}</Row>
              <Row label="Sabores">{(it.sabores ?? []).join(', ') || 'Ninguno'}</Row>
              <Row label="Cantidad">{it.cantidad}</Row>
              <Row label="Subtotal">Q. {it.subtotal.toFixed(2)}</Row>
            </div>
          </div>
        ))}
      </div>

      {/* Footer fijo al fondo de la tarjeta */}
      <div className="mt-auto pt-3">
        <div
          className={`text-center leading-none font-bold ${paytone.className}`}
          style={{ color: COLORS.textRed, fontSize: SIZES.total }}
        >
          Total:&nbsp; Q. {pedido.total.toFixed(2)}
        </div>

        {next && onAdvance && (
          <div className="mt-3 flex justify-end">
            <button
              className="rounded-full text-white shadow-lg transition duration-200 ease-out transform
                         hover:-translate-y-0.5 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ backgroundColor: COLORS.btnRed, fontFamily: paytone.style.fontFamily, fontSize: 14, padding: '8px 14px' }}
              disabled={disabled}
              onClick={() => onAdvance(next)}
            >
              {norm(next.nombre).includes('finaliz') || norm(next.nombre).includes('entreg') ? 'Finalizar' : 'Preparar'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
