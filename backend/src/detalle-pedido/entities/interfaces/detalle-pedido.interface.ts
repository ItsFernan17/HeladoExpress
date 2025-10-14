import { Pedido } from '../../../pedido/entities/pedido.entity';
import { Producto } from '../../../producto/entities/producto.entity';

export interface IDetallePedido {
  id: number;
  pedido_id: Pedido;
  producto_id: Producto;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}
