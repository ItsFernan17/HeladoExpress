import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetallePedido } from '../entities/detalle-pedido.entity';
import { IDetallePedidoRepository } from '../entities/interfaces/detalle-pedido-repository.interface';

@Injectable()
export class DetallePedidoRepository implements IDetallePedidoRepository {
  constructor(
    @InjectRepository(DetallePedido)
    private readonly repository: Repository<DetallePedido>,
  ) {}

  create(detallePedido: Partial<DetallePedido>): DetallePedido {
    return this.repository.create(detallePedido);
  }

  async save(detallePedido: DetallePedido): Promise<DetallePedido> {
    return await this.repository.save(detallePedido);
  }

  async find(options?: any): Promise<DetallePedido[]> {
    return await this.repository.find(options);
  }

  async findOne(options: any): Promise<DetallePedido | null> {
    return await this.repository.findOne(options);
  }

  async findAll(): Promise<DetallePedido[]> {
    return await this.repository.find({
      relations: ['pedido_id', 'producto_id'],
    });
  }

  async findById(id: number): Promise<DetallePedido | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['pedido_id', 'producto_id'],
    });
  }

  async remove(detallePedido: DetallePedido): Promise<void> {
    await this.repository.remove(detallePedido);
  }

  async findByPedidoAndProducto(pedidoId: number, productoId: number): Promise<DetallePedido | null> {
    return await this.repository.findOne({
      where: { 
        pedido_id: { id: pedidoId },
        producto_id: { id: productoId }
      },
      relations: ['pedido_id', 'producto_id'],
    });
  }

  async findByPedido(pedidoId: number): Promise<DetallePedido[]> {
    return await this.repository.find({
      where: { pedido_id: { id: pedidoId } },
      relations: ['pedido_id', 'producto_id'],
    });
  }

  async getTotalByPedido(pedidoId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('detalle')
      .select('SUM(detalle.subtotal)', 'total')
      .where('detalle.pedido_id = :pedidoId', { pedidoId })
      .getRawOne();
    
    return parseFloat(result.total) || 0;
  }

  async deleteByPedido(pedidoId: number): Promise<void> {
    await this.repository.delete({ pedido_id: { id: pedidoId } });
  }
}
