export interface PedidoItem {
  tipo: string;
  nombre: string;
  sabores: string[];
  cantidad: number;
  subtotal: number;
}

export interface PedidoCompleto {
  id: number;      // necesario para PATCH
  pedido: string;  // "#P0001"
  estado: string;  // nombre del estado actual
  items: PedidoItem[];
  total: number;
}
