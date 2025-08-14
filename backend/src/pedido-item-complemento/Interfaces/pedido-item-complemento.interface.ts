// Interfaz principal para la entidad PedidoItemComplemento
export interface IPedidoItemComplemento {
  id: number;
  estado: boolean;
  pedido_item_id: number;
  complemento_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  usuario_ingreso: number;
  fecha_ingreso: Date;
  usuario_modifica?: number;
  fecha_modifica?: Date;
}

// Interfaz para crear un nuevo pedido item complemento
export interface ICreatePedidoItemComplemento {
  pedido_item_id: number;
  complemento_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  usuario_ingreso: number;
}

// Interfaz para actualizar un pedido item complemento existente
export interface IUpdatePedidoItemComplemento {
  pedido_item_id?: number;
  complemento_id?: number;
  cantidad?: number;
  precio_unitario?: number;
  subtotal?: number;
  usuario_modifica?: number;
}
