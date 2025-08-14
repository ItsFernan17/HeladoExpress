// Interfaz principal para la entidad PedidoItem
export interface IPedidoItem {
  id: number;
  estado: boolean;
  pedidoId: number;
  tipo_heladoID: number;
  cantidad: number;
  bolas_solicitadas: number;
  precio_unitario: number;
  precio_unitario_bola_extra: number;
  subtotal: number;
  usuario_ingreso: number;
  fecha_ingreso: Date;
  usuario_modifica?: number;
  fecha_modifica?: Date;
}

// Interfaz para crear un nuevo pedido item
export interface ICreatePedidoItem {
  pedidoId: number;
  tipo_heladoID: number;
  cantidad: number;
  bolas_solicitadas: number;
  precio_unitario: number;
  precio_unitario_bola_extra?: number;
  subtotal: number;
  usuario_ingreso: number;
}

// Interfaz para actualizar un pedido item existente
export interface IUpdatePedidoItem {
  pedidoId?: number;
  tipo_heladoID?: number;
  cantidad?: number;
  bolas_solicitadas?: number;
  precio_unitario?: number;
  precio_unitario_bola_extra?: number;
  subtotal?: number;
  usuario_modifica?: number;
}
