import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoItemComplemento } from './Entities/pedido-item-complemento.entity';
import { CreatePedidoItemComplementoDto } from './Dto/create-pedido-item-complemento.dto';
import { UpdatePedidoItemComplementoDto } from './Dto/update-pedido-item-complemento.dto';
import { IPedidoItemComplemento, ICreatePedidoItemComplemento, IUpdatePedidoItemComplemento } from './Interfaces/pedido-item-complemento.interface';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class PedidoItemComplementoService {
  constructor(
    @InjectRepository(PedidoItemComplemento)
    private readonly pedidoItemComplementoRepository: Repository<PedidoItemComplemento>,
    private readonly usuarioService: UsuarioService,
  ) {}

  // GET todos los pedido item complementos
  async findAll(): Promise<IPedidoItemComplemento[]> {
    try {
      const pedidoItemComplementos = await this.pedidoItemComplementoRepository.find({
        where: { estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (pedidoItemComplementos.length === 0) {
        console.log('No se encontraron pedido item complementos activos');
      }
      
      return pedidoItemComplementos;
    } catch (error) {
      console.error('Error al obtener pedido item complementos:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener pedido item complementos');
    }
  }

  // GET pedido item complemento por ID
  async findOne(id: number): Promise<IPedidoItemComplemento> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido item complemento debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItemComplemento = await this.pedidoItemComplementoRepository.findOne({
        where: { id, estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (!pedidoItemComplemento) {
        throw new NotFoundException(`Pedido item complemento con ID ${id} no encontrado o inactivo`);
      }
      
      return pedidoItemComplemento;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error al buscar pedido item complemento con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido item complemento');
    }
  }

  // POST crear nuevo pedido item complemento
  async create(createPedidoItemComplementoDto: CreatePedidoItemComplementoDto): Promise<IPedidoItemComplemento> {
    // Validar que solo se envíen los campos permitidos para creación
    const camposPermitidos = ['pedido_item_id', 'complemento_id', 'cantidad', 'precio_unitario', 'subtotal', 'usuario_ingreso'];
    const camposEnviados = Object.keys(createPedidoItemComplementoDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en creación: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar DTO
    if (!createPedidoItemComplementoDto.pedido_item_id || createPedidoItemComplementoDto.pedido_item_id <= 0) {
      throw new BadRequestException('El ID del pedido item debe ser un número válido mayor a 0');
    }

    if (!createPedidoItemComplementoDto.complemento_id || createPedidoItemComplementoDto.complemento_id <= 0) {
      throw new BadRequestException('El ID del complemento debe ser un número válido mayor a 0');
    }

    if (!createPedidoItemComplementoDto.cantidad || createPedidoItemComplementoDto.cantidad < 1 || createPedidoItemComplementoDto.cantidad > 100) {
      throw new BadRequestException('La cantidad debe ser un número entre 1 y 100');
    }

    if (!createPedidoItemComplementoDto.precio_unitario || createPedidoItemComplementoDto.precio_unitario < 0) {
      throw new BadRequestException('El precio unitario debe ser un número mayor o igual a 0');
    }

    if (!createPedidoItemComplementoDto.subtotal || createPedidoItemComplementoDto.subtotal < 0) {
      throw new BadRequestException('El subtotal debe ser un número mayor o igual a 0');
    }

    // Validar que usuario_ingreso sea un número válido
    if (!createPedidoItemComplementoDto.usuario_ingreso || 
        isNaN(createPedidoItemComplementoDto.usuario_ingreso) || 
        createPedidoItemComplementoDto.usuario_ingreso <= 0) {
      throw new BadRequestException('El ID del usuario de ingreso debe ser un número válido mayor a 0');
    }

    // Validar que NO se envíen campos incorrectos en creación
    if ('estado' in createPedidoItemComplementoDto) {
      throw new BadRequestException('El campo estado no se puede enviar en creación. Se establece automáticamente como true.');
    }

    if ('id' in createPedidoItemComplementoDto) {
      throw new BadRequestException('El campo id no se puede enviar en creación. Se genera automáticamente.');
    }

    if ('usuario_modifica' in createPedidoItemComplementoDto) {
      throw new BadRequestException('El campo usuario_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    if ('fecha_modifica' in createPedidoItemComplementoDto) {
      throw new BadRequestException('El campo fecha_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    try {
      // Verificar que el usuario de ingreso existe
      try {
        await this.usuarioService.findOne(createPedidoItemComplementoDto.usuario_ingreso);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(`El usuario con ID ${createPedidoItemComplementoDto.usuario_ingreso} no existe o está inactivo`);
        }
        throw error;
      }

      const pedidoItemComplemento = this.pedidoItemComplementoRepository.create({
        pedido_item_id: createPedidoItemComplementoDto.pedido_item_id,
        complemento_id: createPedidoItemComplementoDto.complemento_id,
        cantidad: createPedidoItemComplementoDto.cantidad,
        precio_unitario: createPedidoItemComplementoDto.precio_unitario,
        subtotal: createPedidoItemComplementoDto.subtotal,
        usuario_ingreso: createPedidoItemComplementoDto.usuario_ingreso,
        estado: true,
        fecha_ingreso: new Date()
      });
      
      const pedidoItemComplementoGuardado = await this.pedidoItemComplementoRepository.save(pedidoItemComplemento);
      console.log(`Pedido item complemento creado exitosamente con ID: ${pedidoItemComplementoGuardado.id}`);
      
      return pedidoItemComplementoGuardado;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al crear pedido item complemento:', error);
      throw new InternalServerErrorException('Error interno del servidor al crear pedido item complemento');
    }
  }

  // PUT actualizar pedido item complemento
  async update(id: number, updatePedidoItemComplementoDto: UpdatePedidoItemComplementoDto): Promise<IPedidoItemComplemento> {
    // Validar que solo se envíen los campos permitidos para actualización
    const camposPermitidos = ['pedido_item_id', 'complemento_id', 'cantidad', 'precio_unitario', 'subtotal', 'usuario_modifica'];
    const camposEnviados = Object.keys(updatePedidoItemComplementoDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en actualización: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido item complemento debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItemComplemento = await this.pedidoItemComplementoRepository.findOne({
        where: { id, estado: true }
      });

      if (!pedidoItemComplemento) {
        throw new NotFoundException(`Pedido item complemento con ID ${id} no encontrado o inactivo`);
      }
      
      // Validar pedido_item_id si se va a actualizar
      if (updatePedidoItemComplementoDto.pedido_item_id !== undefined) {
        if (!updatePedidoItemComplementoDto.pedido_item_id || updatePedidoItemComplementoDto.pedido_item_id <= 0) {
          throw new BadRequestException('El ID del pedido item debe ser un número válido mayor a 0');
        }
        pedidoItemComplemento.pedido_item_id = updatePedidoItemComplementoDto.pedido_item_id;
      }

      // Validar complemento_id si se va a actualizar
      if (updatePedidoItemComplementoDto.complemento_id !== undefined) {
        if (!updatePedidoItemComplementoDto.complemento_id || updatePedidoItemComplementoDto.complemento_id <= 0) {
          throw new BadRequestException('El ID del complemento debe ser un número válido mayor a 0');
        }
        pedidoItemComplemento.complemento_id = updatePedidoItemComplementoDto.complemento_id;
      }

      // Validar cantidad si se va a actualizar
      if (updatePedidoItemComplementoDto.cantidad !== undefined) {
        if (!updatePedidoItemComplementoDto.cantidad || updatePedidoItemComplementoDto.cantidad < 1 || updatePedidoItemComplementoDto.cantidad > 100) {
          throw new BadRequestException('La cantidad debe ser un número entre 1 y 100');
        }
        pedidoItemComplemento.cantidad = updatePedidoItemComplementoDto.cantidad;
      }

      // Validar precio_unitario si se va a actualizar
      if (updatePedidoItemComplementoDto.precio_unitario !== undefined) {
        if (updatePedidoItemComplementoDto.precio_unitario < 0) {
          throw new BadRequestException('El precio unitario no puede ser negativo');
        }
        pedidoItemComplemento.precio_unitario = updatePedidoItemComplementoDto.precio_unitario;
      }

      // Validar subtotal si se va a actualizar
      if (updatePedidoItemComplementoDto.subtotal !== undefined) {
        if (updatePedidoItemComplementoDto.subtotal < 0) {
          throw new BadRequestException('El subtotal no puede ser negativo');
        }
        pedidoItemComplemento.subtotal = updatePedidoItemComplementoDto.subtotal;
      }
      
      // Validar que usuario_modifica sea un número válido si se envía
      if (updatePedidoItemComplementoDto.usuario_modifica !== undefined) {
        if (!updatePedidoItemComplementoDto.usuario_modifica || 
            isNaN(updatePedidoItemComplementoDto.usuario_modifica) || 
            updatePedidoItemComplementoDto.usuario_modifica <= 0) {
          throw new BadRequestException('El ID del usuario de modificación debe ser un número válido mayor a 0');
        }
        
        // Verificar que el usuario de modificación existe en la base de datos
        try {
          await this.usuarioService.findOne(updatePedidoItemComplementoDto.usuario_modifica);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException(`El usuario con ID ${updatePedidoItemComplementoDto.usuario_modifica} no existe o está inactivo`);
          }
          throw error;
        }
        
        pedidoItemComplemento.usuario_modifica = updatePedidoItemComplementoDto.usuario_modifica;
      }

      // Validar que NO se envíen campos de solo lectura en actualización
      if ('usuario_ingreso' in updatePedidoItemComplementoDto) {
        throw new BadRequestException('El campo usuario_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('fecha_ingreso' in updatePedidoItemComplementoDto) {
        throw new BadRequestException('El campo fecha_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('estado' in updatePedidoItemComplementoDto) {
        throw new BadRequestException('El campo estado no se puede modificar. Use el endpoint de eliminación lógica.');
      }

      if ('id' in updatePedidoItemComplementoDto) {
        throw new BadRequestException('El campo id no se puede modificar. Es de solo lectura.');
      }
      
      pedidoItemComplemento.fecha_modifica = new Date();
      const pedidoItemComplementoActualizado = await this.pedidoItemComplementoRepository.save(pedidoItemComplemento);
      
      console.log(`Pedido item complemento con ID ${id} actualizado exitosamente`);
      return pedidoItemComplementoActualizado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException || 
          error instanceof ConflictException) {
        throw error;
      }
      console.error(`Error al actualizar pedido item complemento con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al actualizar pedido item complemento');
    }
  }

  // DELETE eliminación lógica (cambiar estado de true a false)
  async remove(id: number, usuarioModificaId: number): Promise<{ message: string }> {
    // Validar ID del pedido item complemento
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido item complemento debe ser un número válido mayor a 0');
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
      const pedidoItemComplemento = await this.pedidoItemComplementoRepository.findOne({
        where: { id, estado: true }
      });

      if (!pedidoItemComplemento) {
        throw new NotFoundException(`Pedido item complemento con ID ${id} no encontrado o inactivo`);
      }
      
      // Verificar si el pedido item complemento ya está inactivo
      if (!pedidoItemComplemento.estado) {
        throw new BadRequestException(`El pedido item complemento con ID ${id} ya está inactivo`);
      }
      
      pedidoItemComplemento.estado = false;
      pedidoItemComplemento.usuario_modifica = usuarioModificaId;
      pedidoItemComplemento.fecha_modifica = new Date();
      await this.pedidoItemComplementoRepository.save(pedidoItemComplemento);
      
      console.log(`Pedido item complemento con ID ${id} eliminado lógicamente`);
      return { message: `Pedido item complemento con ID ${id} eliminado lógicamente` };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al eliminar pedido item complemento con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al eliminar pedido item complemento');
    }
  }

  // Métodos que nos pueden servir: Reactivar pedido item complemento
  async reactivate(id: number): Promise<IPedidoItemComplemento> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido item complemento debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItemComplemento = await this.pedidoItemComplementoRepository.findOne({
        where: { id }
      });

      if (!pedidoItemComplemento) {
        throw new NotFoundException(`Pedido item complemento con ID ${id} no encontrado`);
      }

      if (pedidoItemComplemento.estado) {
        throw new BadRequestException(`El pedido item complemento con ID ${id} ya está activo`);
      }

      pedidoItemComplemento.estado = true;
      pedidoItemComplemento.fecha_modifica = new Date();
      const pedidoItemComplementoReactivado = await this.pedidoItemComplementoRepository.save(pedidoItemComplemento);
      
      console.log(`Pedido item complemento con ID ${id} reactivado exitosamente`);
      return pedidoItemComplementoReactivado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al reactivar pedido item complemento con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al reactivar pedido item complemento');
    }
  }

  // Métodos que nos pueden servir: Buscar pedido item complementos por pedido item
  async findByPedidoItem(pedidoItemId: number): Promise<IPedidoItemComplemento[]> {
    if (!pedidoItemId || isNaN(pedidoItemId) || pedidoItemId <= 0) {
      throw new BadRequestException('El ID del pedido item debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItemComplementos = await this.pedidoItemComplementoRepository.find({
        where: { 
          pedido_item_id: pedidoItemId,
          estado: true 
        }
      });

      if (pedidoItemComplementos.length === 0) {
        console.log(`No se encontraron pedido item complementos para el pedido item con ID ${pedidoItemId}`);
      }

      return pedidoItemComplementos;
    } catch (error) {
      console.error(`Error al buscar pedido item complementos por pedido item ${pedidoItemId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido item complementos por pedido item');
    }
  }

  // Métodos que nos pueden servir: Buscar pedido item complementos por complemento
  async findByComplemento(complementoId: number): Promise<IPedidoItemComplemento[]> {
    if (!complementoId || isNaN(complementoId) || complementoId <= 0) {
      throw new BadRequestException('El ID del complemento debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItemComplementos = await this.pedidoItemComplementoRepository.find({
        where: { 
          complemento_id: complementoId,
          estado: true 
        }
      });

      if (pedidoItemComplementos.length === 0) {
        console.log(`No se encontraron pedido item complementos para el complemento con ID ${complementoId}`);
      }

      return pedidoItemComplementos;
    } catch (error) {
      console.error(`Error al buscar pedido item complementos por complemento ${complementoId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido item complementos por complemento');
    }
  }

  // Métodos que nos pueden servir: Buscar pedido item complementos por rango de precio
  async findByPrecioRange(precioMin: number, precioMax: number): Promise<IPedidoItemComplemento[]> {
    if (precioMin < 0 || precioMax < 0) {
      throw new BadRequestException('Los precios no pueden ser negativos');
    }

    if (precioMin > precioMax) {
      throw new BadRequestException('El precio mínimo no puede ser mayor al precio máximo');
    }

    try {
      const pedidoItemComplementos = await this.pedidoItemComplementoRepository
        .createQueryBuilder('pedidoItemComplemento')
        .where('pedidoItemComplemento.precio_unitario >= :precioMin', { precioMin })
        .andWhere('pedidoItemComplemento.precio_unitario <= :precioMax', { precioMax })
        .andWhere('pedidoItemComplemento.estado = :estado', { estado: true })
        .getMany();

      if (pedidoItemComplementos.length === 0) {
        console.log(`No se encontraron pedido item complementos en el rango de precio ${precioMin} - ${precioMax}`);
      }

      return pedidoItemComplementos;
    } catch (error) {
      console.error(`Error al buscar pedido item complementos por rango de precio ${precioMin} - ${precioMax}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido item complementos por precio');
    }
  }

  // Métodos que nos pueden servir: Obtener pedido item complementos por usuario que los creó
  async findByUsuarioIngreso(usuarioId: number): Promise<IPedidoItemComplemento[]> {
    // Validar ID del usuario
    if (!usuarioId || isNaN(usuarioId) || usuarioId <= 0) {
      throw new BadRequestException('El ID del usuario debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItemComplementos = await this.pedidoItemComplementoRepository.find({
        where: { 
          usuario_ingreso: usuarioId,
          estado: true 
        }
      });

      if (pedidoItemComplementos.length === 0) {
        console.log(`No se encontraron pedido item complementos creados por el usuario con ID ${usuarioId}`);
      }

      return pedidoItemComplementos;
    } catch (error) {
      console.error(`Error al buscar pedido item complementos por usuario ${usuarioId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido item complementos por usuario');
    }
  }

  // Métodos que nos pueden servir: Obtener estadísticas de pedido item complementos
  async getStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    try {
      const [activos, inactivos] = await Promise.all([
        this.pedidoItemComplementoRepository.count({ where: { estado: true } }),
        this.pedidoItemComplementoRepository.count({ where: { estado: false } })
      ]);

      const total = activos + inactivos;
      
      console.log(`Estadísticas de pedido item complementos: Total: ${total}, Activos: ${activos}, Inactivos: ${inactivos}`);
      
      return { total, activos, inactivos };
    } catch (error) {
      console.error('Error al obtener estadísticas de pedido item complementos:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener estadísticas');
    }
  }

  // Métodos que nos pueden servir: Obtener pedido item complementos más caros
  async getMostExpensive(limit: number = 5): Promise<IPedidoItemComplemento[]> {
    if (limit <= 0 || limit > 50) {
      throw new BadRequestException('El límite debe ser un número entre 1 y 50');
    }

    try {
      const pedidoItemComplementos = await this.pedidoItemComplementoRepository
        .createQueryBuilder('pedidoItemComplemento')
        .where('pedidoItemComplemento.estado = :estado', { estado: true })
        .orderBy('pedidoItemComplemento.precio_unitario', 'DESC')
        .limit(limit)
        .getMany();

      if (pedidoItemComplementos.length === 0) {
        console.log('No se encontraron pedido item complementos activos');
      }

      return pedidoItemComplementos;
    } catch (error) {
      console.error(`Error al obtener los ${limit} pedido item complementos más caros:`, error);
      throw new InternalServerErrorException('Error interno del servidor al obtener pedido item complementos más caros');
    }
  }

  // Métodos que nos pueden servir: Calcular total de complementos de un pedido item
  async calculatePedidoItemComplementosTotal(pedidoItemId: number): Promise<{ total: number; complementoCount: number }> {
    if (!pedidoItemId || isNaN(pedidoItemId) || pedidoItemId <= 0) {
      throw new BadRequestException('El ID del pedido item debe ser un número válido mayor a 0');
    }

    try {
      const pedidoItemComplementos = await this.pedidoItemComplementoRepository.find({
        where: { 
          pedido_item_id: pedidoItemId,
          estado: true 
        },
        select: ['subtotal']
      });

      const total = pedidoItemComplementos.reduce((sum, item) => sum + Number(item.subtotal), 0);
      const complementoCount = pedidoItemComplementos.length;

      console.log(`Total de complementos del pedido item ${pedidoItemId}: $${total.toFixed(2)} (${complementoCount} complementos)`);
      
      return { total, complementoCount };
    } catch (error) {
      console.error(`Error al calcular total de complementos del pedido item ${pedidoItemId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al calcular total de complementos del pedido item');
    }
  }

  // Métodos que nos pueden servir: Obtener complementos más populares
  async getMostPopularComplementos(limit: number = 5): Promise<{ complemento_id: number; total_quantity: number; total_revenue: number }[]> {
    if (limit <= 0 || limit > 50) {
      throw new BadRequestException('El límite debe ser un número entre 1 y 50');
    }

    try {
      const result = await this.pedidoItemComplementoRepository
        .createQueryBuilder('pic')
        .select('pic.complemento_id', 'complemento_id')
        .addSelect('SUM(pic.cantidad)', 'total_quantity')
        .addSelect('SUM(pic.subtotal)', 'total_revenue')
        .where('pic.estado = :estado', { estado: true })
        .groupBy('pic.complemento_id')
        .orderBy('total_quantity', 'DESC')
        .limit(limit)
        .getRawMany();

      if (result.length === 0) {
        console.log('No se encontraron datos de complementos populares');
      }

      return result.map(item => ({
        complemento_id: item.complemento_id,
        total_quantity: parseInt(item.total_quantity),
        total_revenue: parseFloat(item.total_revenue)
      }));
    } catch (error) {
      console.error(`Error al obtener los ${limit} complementos más populares:`, error);
      throw new InternalServerErrorException('Error interno del servidor al obtener complementos más populares');
    }
  }
}
