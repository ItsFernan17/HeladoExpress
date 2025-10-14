import { CreatePedidoDto } from '../../dto/create-pedido.dto';
import { UpdatePedidoDto } from '../../dto/update-pedido.dto';
import { Pedido } from '../pedido.entity';

export interface IPedidoService {
  create(createPedidoDto: CreatePedidoDto): Promise<Pedido>;
  findAll(): Promise<Pedido[]>;
  findOne(id: number): Promise<Pedido>;
  update(id: number, updatePedidoDto: UpdatePedidoDto): Promise<Pedido>;
  remove(id: number): Promise<void>;
  findByNumero(numero: string): Promise<Pedido>;
  findPedidosByEstado(estadoId: number): Promise<Pedido[]>;
  countPedidosByEstado(estadoId: number): Promise<number>;
  updateEstado(id: number, estadoId: number): Promise<Pedido>;
  cancelPedido(id: number): Promise<Pedido>;
  getTotalPedidos(): Promise<number>;
  getPedidosActivosCount(): Promise<number>;
}
