import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoItemBola } from './Entities/pedido-item-bola.entity';
import { CreatePedidoItemBolaDto } from './Dto/create-pedido-item-bola.dto';
import { UpdatePedidoItemBolaDto } from './Dto/update-pedido-item-bola.dto';
import { IPedidoItemBola, ICreatePedidoItemBola, IUpdatePedidoItemBola } from './Interfaces/pedido-item-bola.interface';
import { UsuarioService } from '../usuario/usuario.service';
import { SaborService } from '../sabor/sabor.service';
import { PedidoItemService } from '../pedido-item/pedido-item.service';

@Injectable()
export class PedidoItemBolaService {
  constructor(
    @InjectRepository(PedidoItemBola)
    private readonly pedidoItemBolaRepository: Repository<PedidoItemBola>,
    private readonly usuarioService: UsuarioService,
    private readonly saborService: SaborService,
    private readonly pedidoItemService: PedidoItemService,
  ) {}

  // GET todos los pedido item bolas
  async findAll(): Promise<IPedidoItemBola[]> {
    try {
      const pedidoItemBolas = await this.pedidoItemBolaRepository.find({
        where: { estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (pedidoItemBolas.length === 0) {
        console.log('No se encontraron pedido item bolas activos');
      }
      
      return pedidoItemBolas;
    } catch (error) {
      console.error('Error al obtener pedido item bolas:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener pedido item bolas');
    }
  }

  // GET pedido item bola por ID
  async findOne(id: number): Promise<IPedidoItemBola> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido item bola debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItemBola = await this.pedidoItemBolaRepository.findOne({
        where: { id, estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (!pedidoItemBola) {
        throw new NotFoundException(`Pedido item bola con ID ${id} no encontrado o inactivo`);
      }
      
      return pedidoItemBola;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error al buscar pedido item bola con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido item bola');
    }
  }

  // POST crear nuevo pedido item bola
  async create(createPedidoItemBolaDto: CreatePedidoItemBolaDto): Promise<IPedidoItemBola> {
    // Validar que solo se envíen los campos permitidos para creación
    const camposPermitidos = ['pedido_item_id', 'sabor_id', 'usuario_ingreso'];
    const camposEnviados = Object.keys(createPedidoItemBolaDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en creación: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar DTO
    if (!createPedidoItemBolaDto.pedido_item_id || createPedidoItemBolaDto.pedido_item_id <= 0) {
      throw new BadRequestException('El ID del pedido item debe ser un número válido mayor a 0');
    }

    if (!createPedidoItemBolaDto.sabor_id || createPedidoItemBolaDto.sabor_id <= 0) {
      throw new BadRequestException('El ID del sabor debe ser un número válido mayor a 0');
    }

    // Validar que usuario_ingreso sea un número válido
    if (!createPedidoItemBolaDto.usuario_ingreso || 
        isNaN(createPedidoItemBolaDto.usuario_ingreso) || 
        createPedidoItemBolaDto.usuario_ingreso <= 0) {
      throw new BadRequestException('El ID del usuario de ingreso debe ser un número válido mayor a 0');
    }

    // Validar que NO se envíen campos incorrectos en creación
    if ('estado' in createPedidoItemBolaDto) {
      throw new BadRequestException('El campo estado no se puede enviar en creación. Se establece automáticamente como true.');
    }

    if ('id' in createPedidoItemBolaDto) {
      throw new BadRequestException('El campo id no se puede enviar en creación. Se genera automáticamente.');
    }

    if ('usuario_modifica' in createPedidoItemBolaDto) {
      throw new BadRequestException('El campo usuario_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    if ('fecha_modifica' in createPedidoItemBolaDto) {
      throw new BadRequestException('El campo fecha_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    try {
      // Verificar que el usuario de ingreso existe
      try {
        await this.usuarioService.findOne(createPedidoItemBolaDto.usuario_ingreso);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(`El usuario con ID ${createPedidoItemBolaDto.usuario_ingreso} no existe o está inactivo`);
        }
        throw error;
      }

      // Verificar que el pedido item existe
      try {
        await this.pedidoItemService.findOne(createPedidoItemBolaDto.pedido_item_id);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(`El pedido item con ID ${createPedidoItemBolaDto.pedido_item_id} no existe o está inactivo`);
        }
        throw error;
      }

      // Verificar que el sabor existe
      try {
        await this.saborService.findOne(createPedidoItemBolaDto.sabor_id);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(`El sabor con ID ${createPedidoItemBolaDto.sabor_id} no existe o está inactivo`);
        }
        throw error;
      }

      const pedidoItemBola = this.pedidoItemBolaRepository.create({
        pedido_item_id: createPedidoItemBolaDto.pedido_item_id,
        sabor_id: createPedidoItemBolaDto.sabor_id,
        usuario_ingreso: createPedidoItemBolaDto.usuario_ingreso,
        estado: true,
        fecha_ingreso: new Date()
      });
      
      const pedidoItemBolaGuardado = await this.pedidoItemBolaRepository.save(pedidoItemBola);
      console.log(`Pedido item bola creado exitosamente con ID: ${pedidoItemBolaGuardado.id}`);
      
      return pedidoItemBolaGuardado;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al crear pedido item bola:', error);
      throw new InternalServerErrorException('Error interno del servidor al crear pedido item bola');
    }
  }

  // PUT actualizar pedido item bola
  async update(id: number, updatePedidoItemBolaDto: UpdatePedidoItemBolaDto): Promise<IPedidoItemBola> {
    // Validar que solo se envíen los campos permitidos para actualización
    const camposPermitidos = ['pedido_item_id', 'sabor_id', 'usuario_modifica'];
    const camposEnviados = Object.keys(updatePedidoItemBolaDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en actualización: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido item bola debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItemBola = await this.pedidoItemBolaRepository.findOne({
        where: { id, estado: true }
      });

      if (!pedidoItemBola) {
        throw new NotFoundException(`Pedido item bola con ID ${id} no encontrado o inactivo`);
      }
      
      // Validar pedido_item_id si se va a actualizar
      if (updatePedidoItemBolaDto.pedido_item_id !== undefined) {
        if (!updatePedidoItemBolaDto.pedido_item_id || updatePedidoItemBolaDto.pedido_item_id <= 0) {
          throw new BadRequestException('El ID del pedido item debe ser un número válido mayor a 0');
        }
        
        // Verificar que el pedido item existe
        try {
          await this.pedidoItemService.findOne(updatePedidoItemBolaDto.pedido_item_id);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException(`El pedido item con ID ${updatePedidoItemBolaDto.pedido_item_id} no existe o está inactivo`);
          }
          throw error;
        }
        
        pedidoItemBola.pedido_item_id = updatePedidoItemBolaDto.pedido_item_id;
      }

      // Validar sabor_id si se va a actualizar
      if (updatePedidoItemBolaDto.sabor_id !== undefined) {
        if (!updatePedidoItemBolaDto.sabor_id || updatePedidoItemBolaDto.sabor_id <= 0) {
          throw new BadRequestException('El ID del sabor debe ser un número válido mayor a 0');
        }
        
        // Verificar que el sabor existe
        try {
          await this.saborService.findOne(updatePedidoItemBolaDto.sabor_id);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException(`El sabor con ID ${updatePedidoItemBolaDto.sabor_id} no existe o está inactivo`);
          }
          throw error;
        }
        
        pedidoItemBola.sabor_id = updatePedidoItemBolaDto.sabor_id;
      }
      
      // Validar que usuario_modifica sea un número válido si se envía
      if (updatePedidoItemBolaDto.usuario_modifica !== undefined) {
        if (!updatePedidoItemBolaDto.usuario_modifica || 
            isNaN(updatePedidoItemBolaDto.usuario_modifica) || 
            updatePedidoItemBolaDto.usuario_modifica <= 0) {
          throw new BadRequestException('El ID del usuario de modificación debe ser un número válido mayor a 0');
        }
        
        // Verificar que el usuario de modificación existe en la base de datos
        try {
          await this.usuarioService.findOne(updatePedidoItemBolaDto.usuario_modifica);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException(`El usuario con ID ${updatePedidoItemBolaDto.usuario_modifica} no existe o está inactivo`);
          }
          throw error;
        }
        
        pedidoItemBola.usuario_modifica = updatePedidoItemBolaDto.usuario_modifica;
      }

      // Validar que NO se envíen campos de solo lectura en actualización
      if ('usuario_ingreso' in updatePedidoItemBolaDto) {
        throw new BadRequestException('El campo usuario_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('fecha_ingreso' in updatePedidoItemBolaDto) {
        throw new BadRequestException('El campo fecha_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('estado' in updatePedidoItemBolaDto) {
        throw new BadRequestException('El campo estado no se puede modificar. Use el endpoint de eliminación lógica.');
      }

      if ('id' in updatePedidoItemBolaDto) {
        throw new BadRequestException('El campo id no se puede modificar. Es de solo lectura.');
      }
      
      pedidoItemBola.fecha_modifica = new Date();
      const pedidoItemBolaActualizado = await this.pedidoItemBolaRepository.save(pedidoItemBola);
      
      console.log(`Pedido item bola con ID ${id} actualizado exitosamente`);
      return pedidoItemBolaActualizado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException || 
          error instanceof ConflictException) {
        throw error;
      }
      console.error(`Error al actualizar pedido item bola con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al actualizar pedido item bola');
    }
  }

  // DELETE eliminación lógica (cambiar estado de true a false)
  async remove(id: number, usuarioModificaId: number): Promise<{ message: string }> {
    // Validar ID del pedido item bola
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido item bola debe ser un número válido mayor a 0');
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
      const pedidoItemBola = await this.pedidoItemBolaRepository.findOne({
        where: { id, estado: true }
      });

      if (!pedidoItemBola) {
        throw new NotFoundException(`Pedido item bola con ID ${id} no encontrado o inactivo`);
      }
      
      // Verificar si el pedido item bola ya está inactivo
      if (!pedidoItemBola.estado) {
        throw new BadRequestException(`El pedido item bola con ID ${id} ya está inactivo`);
      }
      
      pedidoItemBola.estado = false;
      pedidoItemBola.usuario_modifica = usuarioModificaId;
      pedidoItemBola.fecha_modifica = new Date();
      await this.pedidoItemBolaRepository.save(pedidoItemBola);
      
      console.log(`Pedido item bola con ID ${id} eliminado lógicamente`);
      return { message: `Pedido item bola con ID ${id} eliminado lógicamente` };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al eliminar pedido item bola con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al eliminar pedido item bola');
    }
  }

  // Métodos que nos pueden servir: Reactivar pedido item bola
  async reactivate(id: number): Promise<IPedidoItemBola> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido item bola debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItemBola = await this.pedidoItemBolaRepository.findOne({
        where: { id }
      });

      if (!pedidoItemBola) {
        throw new NotFoundException(`Pedido item bola con ID ${id} no encontrado`);
      }

      if (pedidoItemBola.estado) {
        throw new BadRequestException(`El pedido item bola con ID ${id} ya está activo`);
      }

      pedidoItemBola.estado = true;
      pedidoItemBola.fecha_modifica = new Date();
      const pedidoItemBolaReactivado = await this.pedidoItemBolaRepository.save(pedidoItemBola);
      
      console.log(`Pedido item bola con ID ${id} reactivado exitosamente`);
      return pedidoItemBolaReactivado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al reactivar pedido item bola con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al reactivar pedido item bola');
    }
  }

  // Métodos que nos pueden servir: Buscar pedido item bolas por pedido item
  async findByPedidoItem(pedidoItemId: number): Promise<IPedidoItemBola[]> {
    if (!pedidoItemId || isNaN(pedidoItemId) || pedidoItemId <= 0) {
      throw new BadRequestException('El ID del pedido item debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItemBolas = await this.pedidoItemBolaRepository.find({
        where: { 
          pedido_item_id: pedidoItemId,
          estado: true 
        }
      });

      if (pedidoItemBolas.length === 0) {
        console.log(`No se encontraron pedido item bolas para el pedido item con ID ${pedidoItemId}`);
      }

      return pedidoItemBolas;
    } catch (error) {
      console.error(`Error al buscar pedido item bolas por pedido item ${pedidoItemId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido item bolas por pedido item');
    }
  }

  // Métodos que nos pueden servir: Buscar pedido item bolas por sabor
  async findBySabor(saborId: number): Promise<IPedidoItemBola[]> {
    if (!saborId || isNaN(saborId) || saborId <= 0) {
      throw new BadRequestException('El ID del sabor debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItemBolas = await this.pedidoItemBolaRepository.find({
        where: { 
          sabor_id: saborId,
          estado: true 
        }
      });

      if (pedidoItemBolas.length === 0) {
        console.log(`No se encontraron pedido item bolas para el sabor con ID ${saborId}`);
      }

      return pedidoItemBolas;
    } catch (error) {
      console.error(`Error al buscar pedido item bolas por sabor ${saborId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido item bolas por sabor');
    }
  }

  // Métodos que nos pueden servir: Obtener pedido item bolas por usuario que los creó
  async findByUsuarioIngreso(usuarioId: number): Promise<IPedidoItemBola[]> {
    // Validar ID del usuario
    if (!usuarioId || isNaN(usuarioId) || usuarioId <= 0) {
      throw new BadRequestException('El ID del usuario debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItemBolas = await this.pedidoItemBolaRepository.find({
        where: { 
          usuario_ingreso: usuarioId,
          estado: true 
        }
      });

      if (pedidoItemBolas.length === 0) {
        console.log(`No se encontraron pedido item bolas creados por el usuario con ID ${usuarioId}`);
      }

      return pedidoItemBolas;
    } catch (error) {
      console.error(`Error al buscar pedido item bolas por usuario ${usuarioId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido item bolas por usuario');
    }
  }

  // Métodos que nos pueden servir: Obtener estadísticas de pedido item bolas
  async getStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    try {
      const [activos, inactivos] = await Promise.all([
        this.pedidoItemBolaRepository.count({ where: { estado: true } }),
        this.pedidoItemBolaRepository.count({ where: { estado: false } })
      ]);

      const total = activos + inactivos;
      
      console.log(`Estadísticas de pedido item bolas: Total: ${total}, Activos: ${activos}, Inactivos: ${inactivos}`);
      
      return { total, activos, inactivos };
    } catch (error) {
      console.error('Error al obtener estadísticas de pedido item bolas:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener estadísticas');
    }
  }

  // Métodos que nos pueden servir: Obtener sabores más populares
  async getMostPopularSabores(limit: number = 5): Promise<{ sabor_id: number; total_quantity: number }[]> {
    if (limit <= 0 || limit > 50) {
      throw new BadRequestException('El límite debe ser un número entre 1 y 50');
    }

    try {
      const result = await this.pedidoItemBolaRepository
        .createQueryBuilder('pib')
        .select('pib.sabor_id', 'sabor_id')
        .addSelect('COUNT(pib.id)', 'total_quantity')
        .where('pib.estado = :estado', { estado: true })
        .groupBy('pib.sabor_id')
        .orderBy('total_quantity', 'DESC')
        .limit(limit)
        .getRawMany();

      if (result.length === 0) {
        console.log('No se encontraron datos de sabores populares');
      }

      return result.map(item => ({
        sabor_id: item.sabor_id,
        total_quantity: parseInt(item.total_quantity)
      }));
    } catch (error) {
      console.error(`Error al obtener los ${limit} sabores más populares:`, error);
      throw new InternalServerErrorException('Error interno del servidor al obtener sabores más populares');
    }
  }

  // Métodos que nos pueden servir: Contar bolas por pedido item
  async countBolasByPedidoItem(pedidoItemId: number): Promise<{ bolaCount: number }> {
    if (!pedidoItemId || isNaN(pedidoItemId) || pedidoItemId <= 0) {
      throw new BadRequestException('El ID del pedido item debe ser un número válido mayor a 0');
    }

    try {
      const bolaCount = await this.pedidoItemBolaRepository.count({
        where: { 
          pedido_item_id: pedidoItemId,
          estado: true 
        }
      });

      console.log(`Número de bolas del pedido item ${pedidoItemId}: ${bolaCount}`);
      
      return { bolaCount };
    } catch (error) {
      console.error(`Error al contar bolas del pedido item ${pedidoItemId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al contar bolas del pedido item');
    }
  }
}
