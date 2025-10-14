import { PedidoDetalleSabor } from '../pedido-detalle-sabor.entity';

export interface IPedidoDetalleSaborRepository {
  create(pedidoDetalleSabor: Partial<PedidoDetalleSabor>): PedidoDetalleSabor;
  save(pedidoDetalleSabor: PedidoDetalleSabor): Promise<PedidoDetalleSabor>;
  find(options?: any): Promise<PedidoDetalleSabor[]>;
  findOne(options: any): Promise<PedidoDetalleSabor | null>;
  findActiveStates(): Promise<PedidoDetalleSabor[]>;
  findActiveByIds(detallePedidoId: number, saborId: number): Promise<PedidoDetalleSabor | null>;
  softDeleteByIds(detallePedidoId: number, saborId: number): Promise<void>;
}
