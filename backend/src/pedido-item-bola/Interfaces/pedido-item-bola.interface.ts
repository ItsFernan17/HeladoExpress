// Interfaz principal para la entidad PedidoItemBola
export interface IPedidoItemBola {
  id: number;
  estado: boolean;
  pedido_item_id: number;
  sabor_id: number;
  usuario_ingreso: number;
  fecha_ingreso: Date;
  usuario_modifica?: number;
  fecha_modifica?: Date;
}

// Interfaz para crear un nuevo pedido item bola
export interface ICreatePedidoItemBola {
  pedido_item_id: number;
  sabor_id: number;
  usuario_ingreso: number;
}

// Interfaz para actualizar un pedido item bola existente
export interface IUpdatePedidoItemBola {
  pedido_item_id?: number;
  sabor_id?: number;
  usuario_modifica?: number;
}
