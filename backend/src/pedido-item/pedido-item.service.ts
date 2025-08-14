import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoItem } from './Entities/pedido-item.entity';
import { CreatePedidoItemDto } from './Dto/create-pedido-item.dto';
import { UpdatePedidoItemDto } from './Dto/update-pedido-item.dto';
import { IPedidoItem, ICreatePedidoItem, IUpdatePedidoItem } from './Interfaces/pedido-item.interface';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class PedidoItemService {
  constructor(
    @InjectRepository(PedidoItem)
    private readonly pedidoItemRepository: Repository<PedidoItem>,
    private readonly usuarioService: UsuarioService,
  ) {}

  // GET todos los pedido items
  async findAll(): Promise<IPedidoItem[]> {
    try {
      const pedidoItems = await this.pedidoItemRepository.find({
        where: { estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (pedidoItems.length === 0) {
        console.log('No se encontraron pedido items activos');
      }
      
      return pedidoItems;
    } catch (error) {
      console.error('Error al obtener pedido items:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener pedido items');
    }
  }

  // GET pedido item por ID
  async findOne(id: number): Promise<IPedidoItem> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido item debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItem = await this.pedidoItemRepository.findOne({
        where: { id, estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (!pedidoItem) {
        throw new NotFoundException(`Pedido item con ID ${id} no encontrado o inactivo`);
      }
      
      return pedidoItem;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error al buscar pedido item con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido item');
    }
  }

  // POST crear nuevo pedido item
  async create(createPedidoItemDto: CreatePedidoItemDto): Promise<IPedidoItem> {
    // Validar que solo se envíen los campos permitidos para creación
    const camposPermitidos = ['pedidoId', 'tipo_heladoID', 'cantidad', 'bolas_solicitadas', 'precio_unitario', 'precio_unitario_bola_extra', 'subtotal', 'usuario_ingreso'];
    const camposEnviados = Object.keys(createPedidoItemDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en creación: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar DTO
    if (!createPedidoItemDto.pedidoId || createPedidoItemDto.pedidoId <= 0) {
      throw new BadRequestException('El ID del pedido debe ser un número válido mayor a 0');
    }

    if (!createPedidoItemDto.tipo_heladoID || createPedidoItemDto.tipo_heladoID <= 0) {
      throw new BadRequestException('El ID del tipo de helado debe ser un número válido mayor a 0');
    }

    if (!createPedidoItemDto.cantidad || createPedidoItemDto.cantidad < 1 || createPedidoItemDto.cantidad > 100) {
      throw new BadRequestException('La cantidad debe ser un número entre 1 y 100');
    }

    if (!createPedidoItemDto.bolas_solicitadas || createPedidoItemDto.bolas_solicitadas < 1 || createPedidoItemDto.bolas_solicitadas > 10) {
      throw new BadRequestException('El número de bolas debe ser entre 1 y 10');
    }

    if (!createPedidoItemDto.precio_unitario || createPedidoItemDto.precio_unitario < 0) {
      throw new BadRequestException('El precio unitario debe ser un número mayor o igual a 0');
    }

    if (createPedidoItemDto.precio_unitario_bola_extra !== undefined && createPedidoItemDto.precio_unitario_bola_extra < 0) {
      throw new BadRequestException('El precio por bola extra no puede ser negativo');
    }

    if (!createPedidoItemDto.subtotal || createPedidoItemDto.subtotal < 0) {
      throw new BadRequestException('El subtotal debe ser un número mayor o igual a 0');
    }

    // Validar que usuario_ingreso sea un número válido
    if (!createPedidoItemDto.usuario_ingreso || 
        isNaN(createPedidoItemDto.usuario_ingreso) || 
        createPedidoItemDto.usuario_ingreso <= 0) {
      throw new BadRequestException('El ID del usuario de ingreso debe ser un número válido mayor a 0');
    }

    // Validar que NO se envíen campos incorrectos en creación
    if ('estado' in createPedidoItemDto) {
      throw new BadRequestException('El campo estado no se puede enviar en creación. Se establece automáticamente como true.');
    }

    if ('id' in createPedidoItemDto) {
      throw new BadRequestException('El campo id no se puede enviar en creación. Se genera automáticamente.');
    }

    if ('usuario_modifica' in createPedidoItemDto) {
      throw new BadRequestException('El campo usuario_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    if ('fecha_modifica' in createPedidoItemDto) {
      throw new BadRequestException('El campo fecha_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    try {
      // Verificar que el usuario de ingreso existe
      try {
        await this.usuarioService.findOne(createPedidoItemDto.usuario_ingreso);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(`El usuario con ID ${createPedidoItemDto.usuario_ingreso} no existe o está inactivo`);
        }
        throw error;
      }

      const pedidoItem = this.pedidoItemRepository.create({
        pedidoId: createPedidoItemDto.pedidoId,
        tipo_heladoID: createPedidoItemDto.tipo_heladoID,
        cantidad: createPedidoItemDto.cantidad,
        bolas_solicitadas: createPedidoItemDto.bolas_solicitadas,
        precio_unitario: createPedidoItemDto.precio_unitario,
        precio_unitario_bola_extra: createPedidoItemDto.precio_unitario_bola_extra || 0,
        subtotal: createPedidoItemDto.subtotal,
        usuario_ingreso: createPedidoItemDto.usuario_ingreso,
        estado: true,
        fecha_ingreso: new Date()
      });
      
      const pedidoItemGuardado = await this.pedidoItemRepository.save(pedidoItem);
      console.log(`Pedido item creado exitosamente con ID: ${pedidoItemGuardado.id}`);
      
      return pedidoItemGuardado;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al crear pedido item:', error);
      throw new InternalServerErrorException('Error interno del servidor al crear pedido item');
    }
  }

  // PUT actualizar pedido item
  async update(id: number, updatePedidoItemDto: UpdatePedidoItemDto): Promise<IPedidoItem> {
    // Validar que solo se envíen los campos permitidos para actualización
    const camposPermitidos = ['pedidoId', 'tipo_heladoID', 'cantidad', 'bolas_solicitadas', 'precio_unitario', 'precio_unitario_bola_extra', 'subtotal', 'usuario_modifica'];
    const camposEnviados = Object.keys(updatePedidoItemDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en actualización: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido item debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItem = await this.pedidoItemRepository.findOne({
        where: { id, estado: true }
      });

      if (!pedidoItem) {
        throw new NotFoundException(`Pedido item con ID ${id} no encontrado o inactivo`);
      }
      
      // Validar pedidoId si se va a actualizar
      if (updatePedidoItemDto.pedidoId !== undefined) {
        if (!updatePedidoItemDto.pedidoId || updatePedidoItemDto.pedidoId <= 0) {
          throw new BadRequestException('El ID del pedido debe ser un número válido mayor a 0');
        }
        pedidoItem.pedidoId = updatePedidoItemDto.pedidoId;
      }

      // Validar tipo_heladoID si se va a actualizar
      if (updatePedidoItemDto.tipo_heladoID !== undefined) {
        if (!updatePedidoItemDto.tipo_heladoID || updatePedidoItemDto.tipo_heladoID <= 0) {
          throw new BadRequestException('El ID del tipo de helado debe ser un número válido mayor a 0');
        }
        pedidoItem.tipo_heladoID = updatePedidoItemDto.tipo_heladoID;
      }

      // Validar cantidad si se va a actualizar
      if (updatePedidoItemDto.cantidad !== undefined) {
        if (!updatePedidoItemDto.cantidad || updatePedidoItemDto.cantidad < 1 || updatePedidoItemDto.cantidad > 100) {
          throw new BadRequestException('La cantidad debe ser un número entre 1 y 100');
        }
        pedidoItem.cantidad = updatePedidoItemDto.cantidad;
      }

      // Validar bolas_solicitadas si se va a actualizar
      if (updatePedidoItemDto.bolas_solicitadas !== undefined) {
        if (!updatePedidoItemDto.bolas_solicitadas || updatePedidoItemDto.bolas_solicitadas < 1 || updatePedidoItemDto.bolas_solicitadas > 10) {
          throw new BadRequestException('El número de bolas debe ser entre 1 y 10');
        }
        pedidoItem.bolas_solicitadas = updatePedidoItemDto.bolas_solicitadas;
      }

      // Validar precio_unitario si se va a actualizar
      if (updatePedidoItemDto.precio_unitario !== undefined) {
        if (updatePedidoItemDto.precio_unitario < 0) {
          throw new BadRequestException('El precio unitario no puede ser negativo');
        }
        pedidoItem.precio_unitario = updatePedidoItemDto.precio_unitario;
      }

      // Validar precio_unitario_bola_extra si se va a actualizar
      if (updatePedidoItemDto.precio_unitario_bola_extra !== undefined) {
        if (updatePedidoItemDto.precio_unitario_bola_extra < 0) {
          throw new BadRequestException('El precio por bola extra no puede ser negativo');
        }
        pedidoItem.precio_unitario_bola_extra = updatePedidoItemDto.precio_unitario_bola_extra;
      }

      // Validar subtotal si se va a actualizar
      if (updatePedidoItemDto.subtotal !== undefined) {
        if (updatePedidoItemDto.subtotal < 0) {
          throw new BadRequestException('El subtotal no puede ser negativo');
        }
        pedidoItem.subtotal = updatePedidoItemDto.subtotal;
      }
      
      // Validar que usuario_modifica sea un número válido si se envía
      if (updatePedidoItemDto.usuario_modifica !== undefined) {
        if (!updatePedidoItemDto.usuario_modifica || 
            isNaN(updatePedidoItemDto.usuario_modifica) || 
            updatePedidoItemDto.usuario_modifica <= 0) {
          throw new BadRequestException('El ID del usuario de modificación debe ser un número válido mayor a 0');
        }
        
        // Verificar que el usuario de modificación existe en la base de datos
        try {
          await this.usuarioService.findOne(updatePedidoItemDto.usuario_modifica);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException(`El usuario con ID ${updatePedidoItemDto.usuario_modifica} no existe o está inactivo`);
          }
          throw error;
        }
        
        pedidoItem.usuario_modifica = updatePedidoItemDto.usuario_modifica;
      }

      // Validar que NO se envíen campos de solo lectura en actualización
      if ('usuario_ingreso' in updatePedidoItemDto) {
        throw new BadRequestException('El campo usuario_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('fecha_ingreso' in updatePedidoItemDto) {
        throw new BadRequestException('El campo fecha_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('estado' in updatePedidoItemDto) {
        throw new BadRequestException('El campo estado no se puede modificar. Use el endpoint de eliminación lógica.');
      }

      if ('id' in updatePedidoItemDto) {
        throw new BadRequestException('El campo id no se puede modificar. Es de solo lectura.');
      }
      
      pedidoItem.fecha_modifica = new Date();
      const pedidoItemActualizado = await this.pedidoItemRepository.save(pedidoItem);
      
      console.log(`Pedido item con ID ${id} actualizado exitosamente`);
      return pedidoItemActualizado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException || 
          error instanceof ConflictException) {
        throw error;
      }
      console.error(`Error al actualizar pedido item con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al actualizar pedido item');
    }
  }

  // DELETE eliminación lógica (cambiar estado de true a false)
  async remove(id: number, usuarioModificaId: number): Promise<{ message: string }> {
    // Validar ID del pedido item
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido item debe ser un número válido mayor a 0');
    }

    // Validar ID del usuario que está eliminando
    if (!usuarioModificaId || isNaN(usuarioModificaId) || usuarioModificaId <= 0) {
      throw new BadRequestException('El ID del usuario que está eliminando debe ser un número válido mayor a 0');
    }

    // Verificar que el usuario que está eliminando existe en la base de datos
    try {
      await this.usuarioService.findOne(usuarioModificaId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(`El usuario con ID ${usuarioModificaId} no existe o está inactivo`);
      }
      throw error;
    }

    try {
      const pedidoItem = await this.pedidoItemRepository.findOne({
        where: { id, estado: true }
      });

      if (!pedidoItem) {
        throw new NotFoundException(`Pedido item con ID ${id} no encontrado o inactivo`);
      }
      
      // Verificar si el pedido item ya está inactivo
      if (!pedidoItem.estado) {
        throw new BadRequestException(`El pedido item con ID ${id} ya está inactivo`);
      }
      
      pedidoItem.estado = false;
      pedidoItem.usuario_modifica = usuarioModificaId;
      pedidoItem.fecha_modifica = new Date();
      await this.pedidoItemRepository.save(pedidoItem);
      
      console.log(`Pedido item con ID ${id} eliminado lógicamente`);
      return { message: `Pedido item con ID ${id} eliminado lógicamente` };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al eliminar pedido item con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al eliminar pedido item');
    }
  }

  // Métodos que nos pueden servir: Reactivar pedido item
  async reactivate(id: number): Promise<IPedidoItem> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido item debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItem = await this.pedidoItemRepository.findOne({
        where: { id }
      });

      if (!pedidoItem) {
        throw new NotFoundException(`Pedido item con ID ${id} no encontrado`);
      }

      if (pedidoItem.estado) {
        throw new BadRequestException(`El pedido item con ID ${id} ya está activo`);
      }

      pedidoItem.estado = true;
      pedidoItem.fecha_modifica = new Date();
      const pedidoItemReactivado = await this.pedidoItemRepository.save(pedidoItem);
      
      console.log(`Pedido item con ID ${id} reactivado exitosamente`);
      return pedidoItemReactivado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al reactivar pedido item con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al reactivar pedido item');
    }
  }

  // Métodos que nos pueden servir: Buscar pedido items por pedido
  async findByPedido(pedidoId: number): Promise<IPedidoItem[]> {
    if (!pedidoId || isNaN(pedidoId) || pedidoId <= 0) {
      throw new BadRequestException('El ID del pedido debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItems = await this.pedidoItemRepository.find({
        where: { 
          pedidoId,
          estado: true 
        }
      });

      if (pedidoItems.length === 0) {
        console.log(`No se encontraron pedido items para el pedido con ID ${pedidoId}`);
      }

      return pedidoItems;
    } catch (error) {
      console.error(`Error al buscar pedido items por pedido ${pedidoId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido items por pedido');
    }
  }

  // Métodos que nos pueden servir: Buscar pedido items por tipo de helado
  async findByTipoHelado(tipoHeladoId: number): Promise<IPedidoItem[]> {
    if (!tipoHeladoId || isNaN(tipoHeladoId) || tipoHeladoId <= 0) {
      throw new BadRequestException('El ID del tipo de helado debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItems = await this.pedidoItemRepository.find({
        where: { 
          tipo_heladoID: tipoHeladoId,
          estado: true 
        }
      });

      if (pedidoItems.length === 0) {
        console.log(`No se encontraron pedido items para el tipo de helado con ID ${tipoHeladoId}`);
      }

      return pedidoItems;
    } catch (error) {
      console.error(`Error al buscar pedido items por tipo de helado ${tipoHeladoId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido items por tipo de helado');
    }
  }

  // Métodos que nos pueden servir: Buscar pedido items por rango de precio
  async findByPrecioRange(precioMin: number, precioMax: number): Promise<IPedidoItem[]> {
    if (precioMin < 0 || precioMax < 0) {
      throw new BadRequestException('Los precios no pueden ser negativos');
    }

    if (precioMin > precioMax) {
      throw new BadRequestException('El precio mínimo no puede ser mayor al precio máximo');
    }

    try {
      const pedidoItems = await this.pedidoItemRepository
        .createQueryBuilder('pedidoItem')
        .where('pedidoItem.precio_unitario >= :precioMin', { precioMin })
        .andWhere('pedidoItem.precio_unitario <= :precioMax', { precioMax })
        .andWhere('pedidoItem.estado = :estado', { estado: true })
        .getMany();

      if (pedidoItems.length === 0) {
        console.log(`No se encontraron pedido items en el rango de precio ${precioMin} - ${precioMax}`);
      }

      return pedidoItems;
    } catch (error) {
      console.error(`Error al buscar pedido items por rango de precio ${precioMin} - ${precioMax}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido items por precio');
    }
  }

  // Métodos que nos pueden servir: Obtener pedido items por usuario que los creó
  async findByUsuarioIngreso(usuarioId: number): Promise<IPedidoItem[]> {
    // Validar ID del usuario
    if (!usuarioId || isNaN(usuarioId) || usuarioId <= 0) {
      throw new BadRequestException('El ID del usuario debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItems = await this.pedidoItemRepository.find({
        where: { 
          usuario_ingreso: usuarioId,
          estado: true 
        }
      });

      if (pedidoItems.length === 0) {
        console.log(`No se encontraron pedido items creados por el usuario con ID ${usuarioId}`);
      }

      return pedidoItems;
    } catch (error) {
      console.error(`Error al buscar pedido items por usuario ${usuarioId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido items por usuario');
    }
  }

  // Métodos que nos pueden servir: Obtener estadísticas de pedido items
  async getStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    try {
      const [activos, inactivos] = await Promise.all([
        this.pedidoItemRepository.count({ where: { estado: true } }),
        this.pedidoItemRepository.count({ where: { estado: false } })
      ]);

      const total = activos + inactivos;
      
      console.log(`Estadísticas de pedido items: Total: ${total}, Activos: ${activos}, Inactivos: ${inactivos}`);
      
      return { total, activos, inactivos };
    } catch (error) {
      console.error('Error al obtener estadísticas de pedido items:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener estadísticas');
    }
  }

  // Métodos que nos pueden servir: Obtener pedido items más caros
  async getMostExpensive(limit: number = 5): Promise<IPedidoItem[]> {
    if (limit <= 0 || limit > 50) {
      throw new BadRequestException('El límite debe ser un número entre 1 y 50');
    }

    try {
      const pedidoItems = await this.pedidoItemRepository
        .createQueryBuilder('pedidoItem')
        .where('pedidoItem.estado = :estado', { estado: true })
        .orderBy('pedidoItem.precio_unitario', 'DESC')
        .limit(limit)
        .getMany();

      if (pedidoItems.length === 0) {
        console.log('No se encontraron pedido items activos');
      }

      return pedidoItems;
    } catch (error) {
      console.error(`Error al obtener los ${limit} pedido items más caros:`, error);
      throw new InternalServerErrorException('Error interno del servidor al obtener pedido items más caros');
    }
  }

  // Métodos que nos pueden servir: Calcular total de un pedido
  async calculatePedidoTotal(pedidoId: number): Promise<{ total: number; itemCount: number }> {
    if (!pedidoId || isNaN(pedidoId) || pedidoId <= 0) {
      throw new BadRequestException('El ID del pedido debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItems = await this.pedidoItemRepository.find({
        where: { 
          pedidoId,
          estado: true 
        },
        select: ['subtotal']
      });

      const total = pedidoItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
      const itemCount = pedidoItems.length;

      console.log(`Total del pedido ${pedidoId}: $${total.toFixed(2)} (${itemCount} items)`);
      
      return { total, itemCount };
    } catch (error) {
      console.error(`Error al calcular total del pedido ${pedidoId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al calcular total del pedido');
    }
  }
}
