import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { CreateDetallePedidoDto } from '../dto/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from '../dto/update-detalle-pedido.dto';
import { DetallePedido } from '../entities/detalle-pedido.entity';
import { IDetallePedidoService } from '../entities/interfaces/detalle-pedido-service.interface';
import { DetallePedidoRepository } from '../repositories/detalle-pedido.repository';
import { PedidoService } from '../../pedido/services/pedido.service';
import { ProductoService } from '../../producto/services/producto.service';

@Injectable()
export class DetallePedidoService implements IDetallePedidoService {
  constructor(
    private readonly detallePedidoRepository: DetallePedidoRepository,
    @Inject(forwardRef(() => PedidoService))
    private readonly pedidoService: PedidoService,
    private readonly productoService: ProductoService,
  ) {}

  async create(createDetallePedidoDto: CreateDetallePedidoDto): Promise<DetallePedido> {
    // Validar que el pedido existe y está activo
    const pedido = await this.pedidoService.findOne(createDetallePedidoDto.pedido_id);
    
    // Validar que el producto existe y está activo
    const producto = await this.productoService.findOne(createDetallePedidoDto.producto_id);
    
    // Validar que no existe ya el mismo producto en el mismo pedido
    const existingDetalle = await this.detallePedidoRepository.findByPedidoAndProducto(
      createDetallePedidoDto.pedido_id, 
      createDetallePedidoDto.producto_id
    );
    
    if (existingDetalle) {
      throw new ConflictException('Este producto ya está agregado al pedido. Use actualizar para modificar la cantidad.');
    }
    
    // Validar que la cantidad es válida
    if (createDetallePedidoDto.cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }
    
    // Validar que el precio unitario coincide con el precio base del producto
    if (Math.abs(createDetallePedidoDto.precio_unitario - producto.precio_base) > 0.01) {
      throw new BadRequestException('El precio unitario no coincide con el precio del producto');
    }
    
    // Calcular y validar subtotal
    const subtotalCalculado = createDetallePedidoDto.cantidad * createDetallePedidoDto.precio_unitario;
    if (Math.abs(createDetallePedidoDto.subtotal - subtotalCalculado) > 0.01) {
      throw new BadRequestException('El subtotal no coincide con cantidad × precio unitario');
    }
    
    // Validar que el pedido puede ser modificado (no está en estado final)
    if (!this.canModifyPedido(pedido.estado_id.id)) {
      throw new ForbiddenException('No se pueden agregar productos a un pedido en este estado');
    }
    
    const detallePedido = this.detallePedidoRepository.create({
      cantidad: createDetallePedidoDto.cantidad,
      precio_unitario: createDetallePedidoDto.precio_unitario,
      subtotal: subtotalCalculado, // Usar el calculado para asegurar precisión
      pedido_id: pedido,
      producto_id: producto,
    });
    
    return await this.detallePedidoRepository.save(detallePedido);
  }

  async findAll(): Promise<DetallePedido[]> {
    return await this.detallePedidoRepository.findAll();
  }

  async findOne(id: number): Promise<DetallePedido> {
    const detallePedido = await this.detallePedidoRepository.findById(id);

    if (!detallePedido) {
      throw new NotFoundException(`Detalle de pedido con ID ${id} no encontrado`);
    }

    return detallePedido;
  }

  async update(id: number, updateDetallePedidoDto: UpdateDetallePedidoDto): Promise<DetallePedido> {
    const detallePedido = await this.findOne(id);
    
    // Si se está cambiando el pedido, validar que existe y está activo
    if (updateDetallePedidoDto.pedido_id) {
      const pedido = await this.pedidoService.findOne(updateDetallePedidoDto.pedido_id);
      detallePedido.pedido_id = pedido;
    }
    
    // Si se está cambiando el producto, validar que existe y está activo
    if (updateDetallePedidoDto.producto_id) {
      const producto = await this.productoService.findOne(updateDetallePedidoDto.producto_id);
      detallePedido.producto_id = producto;
    }
    
    // Asignar otros campos si existen
    if (updateDetallePedidoDto.cantidad) {
      detallePedido.cantidad = updateDetallePedidoDto.cantidad;
    }
    if (updateDetallePedidoDto.precio_unitario) {
      detallePedido.precio_unitario = updateDetallePedidoDto.precio_unitario;
    }
    if (updateDetallePedidoDto.subtotal) {
      detallePedido.subtotal = updateDetallePedidoDto.subtotal;
    }
    
    return await this.detallePedidoRepository.save(detallePedido);
  }

  async remove(id: number): Promise<void> {
    const detallePedido = await this.findOne(id);
    
    if (!detallePedido) {
      throw new NotFoundException(`Detalle de pedido con ID ${id} no encontrado`);
    }

    // Validar que el pedido puede ser modificado
    if (!this.canModifyPedido(detallePedido.pedido_id.estado_id.id)) {
      throw new ForbiddenException('No se pueden eliminar productos de un pedido en este estado');
    }

    await this.detallePedidoRepository.remove(detallePedido);
  }

  async findByPedido(pedidoId: number): Promise<DetallePedido[]> {
    // Validar que el pedido existe
    await this.pedidoService.findOne(pedidoId);
    
    return await this.detallePedidoRepository.findByPedido(pedidoId);
  }

  async getTotalPedido(pedidoId: number): Promise<number> {
    // Validar que el pedido existe
    await this.pedidoService.findOne(pedidoId);
    
    return await this.detallePedidoRepository.getTotalByPedido(pedidoId);
  }

  async updateCantidad(id: number, nuevaCantidad: number): Promise<DetallePedido> {
    if (nuevaCantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    const detallePedido = await this.findOne(id);
    
    // Validar que el pedido puede ser modificado
    if (!this.canModifyPedido(detallePedido.pedido_id.estado_id.id)) {
      throw new ForbiddenException('No se puede modificar la cantidad en un pedido en este estado');
    }
    
    // Recalcular subtotal
    detallePedido.cantidad = nuevaCantidad;
    detallePedido.subtotal = nuevaCantidad * detallePedido.precio_unitario;
    
    return await this.detallePedidoRepository.save(detallePedido);
  }

  async deleteAllByPedido(pedidoId: number): Promise<void> {
    const pedido = await this.pedidoService.findOne(pedidoId);
    
    // Validar que el pedido puede ser modificado
    if (!this.canModifyPedido(pedido.estado_id.id)) {
      throw new ForbiddenException('No se pueden eliminar productos de un pedido en este estado');
    }
    
    await this.detallePedidoRepository.deleteByPedido(pedidoId);
  }

  async calculateSubtotal(cantidad: number, precioUnitario: number): Promise<number> {
    if (cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }
    if (precioUnitario <= 0) {
      throw new BadRequestException('El precio unitario debe ser mayor a 0');
    }
    
    return Number((cantidad * precioUnitario).toFixed(2));
  }

  async validatePrecioWithProduct(productoId: number, precioUnitario: number): Promise<boolean> {
    const producto = await this.productoService.findOne(productoId);
    return Math.abs(precioUnitario - producto.precio_base) <= 0.01;
  }

  // Métodos privados de validación
  private canModifyPedido(estadoId: number): boolean {
    // Solo se pueden modificar pedidos en estado Pendiente (1) o En Proceso (2)
    return [1, 2].includes(estadoId);
  }

  private calculateSubtotalPrivate(cantidad: number, precioUnitario: number): number {
    return Number((cantidad * precioUnitario).toFixed(2));
  }
}
