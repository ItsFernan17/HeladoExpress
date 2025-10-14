import { Pedido } from '../pedido.entity';

export interface IPedidoRepository {
  create(pedido: Partial<Pedido>): Pedido;
  save(pedido: Pedido): Promise<Pedido>;
  find(options?: any): Promise<Pedido[]>;
  findOne(options: any): Promise<Pedido | null>;
  findActiveStates(): Promise<Pedido[]>;
  findActiveById(id: number): Promise<Pedido | null>;
  softDeleteById(id: number): Promise<void>;
  findByNumero(numero: string): Promise<Pedido | null>;
  findByEstado(estadoId: number): Promise<Pedido[]>;
  countByEstado(estadoId: number): Promise<number>;
  hasDetalles(pedidoId: number): Promise<boolean>;
  getTotalCount(): Promise<number>;
  getActiveCount(): Promise<number>;
}
