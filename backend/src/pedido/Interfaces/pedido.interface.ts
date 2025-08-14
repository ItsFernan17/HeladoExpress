// Interfaz principal para la entidad Pedido
export interface IPedido {
  id: number;
  estado: boolean;
  codigo: string;
  estado_pedido: string;
  notas?: string;
  usuario_ingreso: number;
  fecha_ingreso: Date;
  usuario_modifica?: number;
  fecha_modifica?: Date;
}

// Interfaz para crear un nuevo pedido
export interface ICreatePedido {
  codigo: string;
  estado_pedido: string;
  notas?: string;
  usuario_ingreso: number;
}

// Interfaz para actualizar un pedido existente
export interface IUpdatePedido {
  codigo?: string;
  estado_pedido?: string;
  notas?: string;
  usuario_modifica?: number;
}
