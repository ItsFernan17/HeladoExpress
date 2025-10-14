import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePedidoDetalleSaborDto } from '../dto/create-pedido-detalle-sabor.dto';
import { UpdatePedidoDetalleSaborDto } from '../dto/update-pedido-detalle-sabor.dto';
import { PedidoDetalleSabor } from '../entities/pedido-detalle-sabor.entity';
import { IPedidoDetalleSaborService } from '../entities/interfaces/pedido-detalle-sabor-service.interface';
import { PedidoDetalleSaborRepository } from '../repositories/pedido-detalle-sabor.repository';
import { DetallePedidoService } from '../../detalle-pedido/services/detalle-pedido.service';
import { SaborService } from '../../sabor/services/sabor.service';

@Injectable()
export class PedidoDetalleSaborService implements IPedidoDetalleSaborService {
  constructor(
    private readonly pedidoDetalleSaborRepository: PedidoDetalleSaborRepository,
    private readonly detallePedidoService: DetallePedidoService,
    private readonly saborService: SaborService,
  ) {}

  async create(createPedidoDetalleSaborDto: CreatePedidoDetalleSaborDto): Promise<PedidoDetalleSabor> {
    // Validar que el detalle de pedido existe y está activo
    const detallePedido = await this.detallePedidoService.findOne(createPedidoDetalleSaborDto.detalle_pedido_id);
    
    // Validar que el sabor existe y está activo
    const sabor = await this.saborService.findOne(createPedidoDetalleSaborDto.sabor_id);
    
    const pedidoDetalleSabor = this.pedidoDetalleSaborRepository.create({
      detalle_pedido_id: createPedidoDetalleSaborDto.detalle_pedido_id,
      sabor_id: createPedidoDetalleSaborDto.sabor_id,
    });
    
    return await this.pedidoDetalleSaborRepository.save(pedidoDetalleSabor);
  }

  async findAll(): Promise<PedidoDetalleSabor[]> {
    return await this.pedidoDetalleSaborRepository.findActiveStates();
  }

  async findOne(detallePedidoId: number, saborId: number): Promise<PedidoDetalleSabor> {
    const pedidoDetalleSabor = await this.pedidoDetalleSaborRepository.findActiveByIds(detallePedidoId, saborId);

    if (!pedidoDetalleSabor) {
      throw new NotFoundException(`Pedido detalle sabor con detalle_pedido_id ${detallePedidoId} y sabor_id ${saborId} no encontrado`);
    }

    return pedidoDetalleSabor;
  }

  async update(detallePedidoId: number, saborId: number, updatePedidoDetalleSaborDto: UpdatePedidoDetalleSaborDto): Promise<PedidoDetalleSabor> {
    const pedidoDetalleSabor = await this.findOne(detallePedidoId, saborId);
    
    // Actualizar estado activo si se proporciona
    if (updatePedidoDetalleSaborDto.esta_activo !== undefined) {
      pedidoDetalleSabor.esta_activo = updatePedidoDetalleSaborDto.esta_activo;
    }
    
    return await this.pedidoDetalleSaborRepository.save(pedidoDetalleSabor);
  }

  async remove(detallePedidoId: number, saborId: number): Promise<void> {
    const pedidoDetalleSabor = await this.findOne(detallePedidoId, saborId);
    
    if (!pedidoDetalleSabor) {
      throw new NotFoundException(`Pedido detalle sabor con detalle_pedido_id ${detallePedidoId} y sabor_id ${saborId} no encontrado`);
    }

    await this.pedidoDetalleSaborRepository.softDeleteByIds(detallePedidoId, saborId);
  }

  // Métodos auxiliares para mantener compatibilidad con el controlador existente
  async findOneById(id: number): Promise<PedidoDetalleSabor> {
    // Este método es solo para compatibilidad, realmente necesitamos ambos IDs
    const allActive = await this.findAll();
    const found = allActive.find(item => 
      item.detalle_pedido_id === id || item.sabor_id === id
    );
    
    if (!found) {
      throw new NotFoundException(`Pedido detalle sabor con ID ${id} no encontrado`);
    }
    
    return found;
  }

  async updateById(id: number, updatePedidoDetalleSaborDto: UpdatePedidoDetalleSaborDto): Promise<PedidoDetalleSabor> {
    const existing = await this.findOneById(id);
    return this.update(existing.detalle_pedido_id, existing.sabor_id, updatePedidoDetalleSaborDto);
  }

  async removeById(id: number): Promise<void> {
    const existing = await this.findOneById(id);
    return this.remove(existing.detalle_pedido_id, existing.sabor_id);
  }
}
