import { DetallePedido } from '../detalle-pedido.entity';

export interface IDetallePedidoRepository {
  create(detallePedido: Partial<DetallePedido>): DetallePedido;
  save(detallePedido: DetallePedido): Promise<DetallePedido>;
  find(options?: any): Promise<DetallePedido[]>;
  findOne(options: any): Promise<DetallePedido | null>;
  findAll(): Promise<DetallePedido[]>;
  findById(id: number): Promise<DetallePedido | null>;
  remove(detallePedido: DetallePedido): Promise<void>;
  findByPedidoAndProducto(pedidoId: number, productoId: number): Promise<DetallePedido | null>;
  findByPedido(pedidoId: number): Promise<DetallePedido[]>;
  getTotalByPedido(pedidoId: number): Promise<number>;
  deleteByPedido(pedidoId: number): Promise<void>;
}
