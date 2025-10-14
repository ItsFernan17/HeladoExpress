import { CreateDetallePedidoDto } from '../../dto/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from '../../dto/update-detalle-pedido.dto';
import { DetallePedido } from '../detalle-pedido.entity';

export interface IDetallePedidoService {
  create(createDetallePedidoDto: CreateDetallePedidoDto): Promise<DetallePedido>;
  findAll(): Promise<DetallePedido[]>;
  findOne(id: number): Promise<DetallePedido>;
  update(id: number, updateDetallePedidoDto: UpdateDetallePedidoDto): Promise<DetallePedido>;
  remove(id: number): Promise<void>;
  findByPedido(pedidoId: number): Promise<DetallePedido[]>;
  getTotalPedido(pedidoId: number): Promise<number>;
  updateCantidad(id: number, nuevaCantidad: number): Promise<DetallePedido>;
  deleteAllByPedido(pedidoId: number): Promise<void>;
  calculateSubtotal(cantidad: number, precioUnitario: number): Promise<number>;
  validatePrecioWithProduct(productoId: number, precioUnitario: number): Promise<boolean>;
}
