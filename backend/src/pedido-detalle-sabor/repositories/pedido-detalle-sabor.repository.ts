import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoDetalleSabor } from '../entities/pedido-detalle-sabor.entity';
import { IPedidoDetalleSaborRepository } from '../entities/interfaces/pedido-detalle-sabor-repository.interface';

@Injectable()
export class PedidoDetalleSaborRepository implements IPedidoDetalleSaborRepository {
  constructor(
    @InjectRepository(PedidoDetalleSabor)
    private readonly repository: Repository<PedidoDetalleSabor>,
  ) {}

  create(pedidoDetalleSabor: Partial<PedidoDetalleSabor>): PedidoDetalleSabor {
    return this.repository.create(pedidoDetalleSabor);
  }

  async save(pedidoDetalleSabor: PedidoDetalleSabor): Promise<PedidoDetalleSabor> {
    return await this.repository.save(pedidoDetalleSabor);
  }

  async find(options?: any): Promise<PedidoDetalleSabor[]> {
    return await this.repository.find(options);
  }

  async findOne(options: any): Promise<PedidoDetalleSabor | null> {
    return await this.repository.findOne(options);
  }

  async findActiveStates(): Promise<PedidoDetalleSabor[]> {
    return await this.repository.find({
      where: { esta_activo: true },
      relations: ['detalle_pedido', 'sabor'],
    });
  }

  async findActiveByIds(detallePedidoId: number, saborId: number): Promise<PedidoDetalleSabor | null> {
    return await this.repository.findOne({
      where: { 
        detalle_pedido_id: detallePedidoId, 
        sabor_id: saborId, 
        esta_activo: true 
      },
      relations: ['detalle_pedido', 'sabor'],
    });
  }

  async softDeleteByIds(detallePedidoId: number, saborId: number): Promise<void> {
    await this.repository.update(
      { detalle_pedido_id: detallePedidoId, sabor_id: saborId }, 
      { esta_activo: false }
    );
  }
}
