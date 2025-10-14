import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../entities/pedido.entity';
import { IPedidoRepository } from '../entities/interfaces/pedido-repository.interface';

@Injectable()
export class PedidoRepository implements IPedidoRepository {
  constructor(
    @InjectRepository(Pedido)
    private readonly repository: Repository<Pedido>,
  ) {}

  create(pedido: Partial<Pedido>): Pedido {
    return this.repository.create(pedido);
  }

  async save(pedido: Pedido): Promise<Pedido> {
    return await this.repository.save(pedido);
  }

  async find(options?: any): Promise<Pedido[]> {
    return await this.repository.find(options);
  }

  async findOne(options: any): Promise<Pedido | null> {
    return await this.repository.findOne(options);
  }

  async findActiveStates(): Promise<Pedido[]> {
    return await this.repository.find({
      where: { esta_activo: true },
      relations: ['estado_id'],
    });
  }

  async findActiveById(id: number): Promise<Pedido | null> {
    return await this.repository.findOne({
      where: { id, esta_activo: true },
      relations: ['estado_id'],
    });
  }

  async softDeleteById(id: number): Promise<void> {
    await this.repository.update(id, { esta_activo: false });
  }

  async findByNumero(numero: string): Promise<Pedido | null> {
    return await this.repository.findOne({
      where: { numero },
      relations: ['estado_id'],
    });
  }

  async findByEstado(estadoId: number): Promise<Pedido[]> {
    return await this.repository.find({
      where: { 
        estado_id: { id: estadoId },
        esta_activo: true 
      },
      relations: ['estado_id'],
    });
  }

  async countByEstado(estadoId: number): Promise<number> {
    return await this.repository.count({
      where: { 
        estado_id: { id: estadoId },
        esta_activo: true 
      },
    });
  }

  async hasDetalles(pedidoId: number): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('pedido')
      .leftJoin('detalle_pedido', 'detalle', 'detalle.pedido_id = pedido.id')
      .where('pedido.id = :pedidoId', { pedidoId })
      .andWhere('detalle.id IS NOT NULL')
      .getCount();
    
    return count > 0;
  }

  async getTotalCount(): Promise<number> {
    return await this.repository.count();
  }

  async getActiveCount(): Promise<number> {
    return await this.repository.count({
      where: { esta_activo: true },
    });
  }

  async getLastPedidoNumber(): Promise<string | null> {
    const result = await this.repository
      .createQueryBuilder('pedido')
      .select('pedido.numero')
      .where('pedido.esta_activo = :activo', { activo: true })
      .andWhere('pedido.numero LIKE :pattern', { pattern: 'P%' })
      .orderBy('CAST(SUBSTRING(pedido.numero, 2) AS UNSIGNED)', 'DESC')
      .limit(1)
      .getOne();
    
    return result?.numero || null;
  }
}
