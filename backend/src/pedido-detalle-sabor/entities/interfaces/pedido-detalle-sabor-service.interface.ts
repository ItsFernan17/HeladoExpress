import { CreatePedidoDetalleSaborDto } from '../../dto/create-pedido-detalle-sabor.dto';
import { UpdatePedidoDetalleSaborDto } from '../../dto/update-pedido-detalle-sabor.dto';
import { PedidoDetalleSabor } from '../pedido-detalle-sabor.entity';

export interface IPedidoDetalleSaborService {
  create(createPedidoDetalleSaborDto: CreatePedidoDetalleSaborDto): Promise<PedidoDetalleSabor>;
  findAll(): Promise<PedidoDetalleSabor[]>;
  findOne(detallePedidoId: number, saborId: number): Promise<PedidoDetalleSabor>;
  update(detallePedidoId: number, saborId: number, updatePedidoDetalleSaborDto: UpdatePedidoDetalleSaborDto): Promise<PedidoDetalleSabor>;
  remove(detallePedidoId: number, saborId: number): Promise<void>;
}
