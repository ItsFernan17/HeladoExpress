import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './Entities/pedido.entity';
import { CreatePedidoDto } from './Dto/create-pedido.dto';
import { UpdatePedidoDto } from './Dto/update-pedido.dto';
import { IPedido, ICreatePedido, IUpdatePedido } from './Interfaces/pedido.interface';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    private readonly usuarioService: UsuarioService,
  ) {}

  // GET todos los pedidos
  async findAll(): Promise<IPedido[]> {
    try {
      const pedidos = await this.pedidoRepository.find({
        where: { estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (pedidos.length === 0) {
        console.log('No se encontraron pedidos activos');
      }
      
      return pedidos;
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener pedidos');
    }
  }

  // GET pedido por ID
  async findOne(id: number): Promise<IPedido> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido debe ser un número válido mayor a 0');
    }

    try {
      const pedido = await this.pedidoRepository.findOne({
        where: { id, estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (!pedido) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado o inactivo`);
      }
      
      return pedido;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error al buscar pedido con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedido');
    }
  }

  // POST crear nuevo pedido
  async create(createPedidoDto: CreatePedidoDto): Promise<IPedido> {
    // Validar que solo se envíen los campos permitidos para creación
    const camposPermitidos = ['codigo', 'estado_pedido', 'notas', 'usuario_ingreso'];
    const camposEnviados = Object.keys(createPedidoDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en creación: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar DTO
    if (!createPedidoDto.codigo || createPedidoDto.codigo.trim().length === 0) {
      throw new BadRequestException('El código del pedido no puede estar vacío');
    }

    if (createPedidoDto.codigo.trim().length < 3) {
      throw new BadRequestException('El código del pedido debe tener al menos 3 caracteres');
    }

    if (createPedidoDto.codigo.trim().length > 50) {
      throw new BadRequestException('El código del pedido no puede exceder 50 caracteres');
    }

    if (!createPedidoDto.estado_pedido || createPedidoDto.estado_pedido.trim().length === 0) {
      throw new BadRequestException('El estado del pedido no puede estar vacío');
    }

    if (createPedidoDto.estado_pedido.trim().length < 3) {
      throw new BadRequestException('El estado del pedido debe tener al menos 3 caracteres');
    }

    if (createPedidoDto.estado_pedido.trim().length > 50) {
      throw new BadRequestException('El estado del pedido no puede exceder 50 caracteres');
    }

    // Validar que usuario_ingreso sea un número válido
    if (!createPedidoDto.usuario_ingreso || 
        isNaN(createPedidoDto.usuario_ingreso) || 
        createPedidoDto.usuario_ingreso <= 0) {
      throw new BadRequestException('El ID del usuario de ingreso debe ser un número válido mayor a 0');
    }

    // Validar que NO se envíen campos incorrectos en creación
    if ('estado' in createPedidoDto) {
      throw new BadRequestException('El campo estado no se puede enviar en creación. Se establece automáticamente como true.');
    }

    if ('id' in createPedidoDto) {
      throw new BadRequestException('El campo id no se puede enviar en creación. Se genera automáticamente.');
    }

    if ('usuario_modifica' in createPedidoDto) {
      throw new BadRequestException('El campo usuario_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    if ('fecha_modifica' in createPedidoDto) {
      throw new BadRequestException('El campo fecha_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    try {
      // Verificar si ya existe un pedido con el mismo código
      const pedidoExistente = await this.pedidoRepository.findOne({
        where: { 
          codigo: createPedidoDto.codigo.trim(),
          estado: true 
        }
      });

      if (pedidoExistente) {
        throw new ConflictException(`Ya existe un pedido activo con el código '${createPedidoDto.codigo}'`);
      }

      // Verificar que el usuario de ingreso existe
      try {
        await this.usuarioService.findOne(createPedidoDto.usuario_ingreso);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(`El usuario con ID ${createPedidoDto.usuario_ingreso} no existe o está inactivo`);
        }
        throw error;
      }

      const pedido = this.pedidoRepository.create({
        codigo: createPedidoDto.codigo.trim(),
        estado_pedido: createPedidoDto.estado_pedido.trim(),
        notas: createPedidoDto.notas?.trim(),
        usuario_ingreso: createPedidoDto.usuario_ingreso,
        estado: true,
        fecha_ingreso: new Date()
      });
      
      const pedidoGuardado = await this.pedidoRepository.save(pedido);
      console.log(`Pedido creado exitosamente con ID: ${pedidoGuardado.id}`);
      
      return pedidoGuardado;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al crear pedido:', error);
      throw new InternalServerErrorException('Error interno del servidor al crear pedido');
    }
  }

  // PUT actualizar pedido
  async update(id: number, updatePedidoDto: UpdatePedidoDto): Promise<IPedido> {
    // Validar que solo se envíen los campos permitidos para actualización
    const camposPermitidos = ['codigo', 'estado_pedido', 'notas', 'usuario_modifica'];
    const camposEnviados = Object.keys(updatePedidoDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en actualización: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido debe ser un número válido mayor a 0');
    }

    try {
      const pedido = await this.pedidoRepository.findOne({
        where: { id, estado: true }
      });

      if (!pedido) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado o inactivo`);
      }
      
      // Validar código si se va a actualizar
      if (updatePedidoDto.codigo !== undefined) {
        if (!updatePedidoDto.codigo || updatePedidoDto.codigo.trim().length === 0) {
          throw new BadRequestException('El código del pedido no puede estar vacío');
        }

        if (updatePedidoDto.codigo.trim().length < 3) {
          throw new BadRequestException('El código del pedido debe tener al menos 3 caracteres');
        }

        if (updatePedidoDto.codigo.trim().length > 50) {
          throw new BadRequestException('El código del pedido no puede exceder 50 caracteres');
        }

        // Verificar si ya existe otro pedido con el mismo código
        const pedidoExistente = await this.pedidoRepository.findOne({
          where: { 
            codigo: updatePedidoDto.codigo.trim(),
            estado: true
          }
        });

        if (pedidoExistente && pedidoExistente.id !== id) {
          throw new ConflictException(`Ya existe otro pedido activo con el código '${updatePedidoDto.codigo}'`);
        }

        pedido.codigo = updatePedidoDto.codigo.trim();
      }

      // Validar estado_pedido si se va a actualizar
      if (updatePedidoDto.estado_pedido !== undefined) {
        if (!updatePedidoDto.estado_pedido || updatePedidoDto.estado_pedido.trim().length === 0) {
          throw new BadRequestException('El estado del pedido no puede estar vacío');
        }

        if (updatePedidoDto.estado_pedido.trim().length < 3) {
          throw new BadRequestException('El estado del pedido debe tener al menos 3 caracteres');
        }

        if (updatePedidoDto.estado_pedido.trim().length > 50) {
          throw new BadRequestException('El estado del pedido no puede exceder 50 caracteres');
        }

        pedido.estado_pedido = updatePedidoDto.estado_pedido.trim();
      }

      // Validar notas si se va a actualizar
      if (updatePedidoDto.notas !== undefined) {
        if (updatePedidoDto.notas && updatePedidoDto.notas.trim().length > 1000) {
          throw new BadRequestException('Las notas no deben exceder 1000 caracteres');
        }
        pedido.notas = updatePedidoDto.notas?.trim();
      }
      
      // Validar que usuario_modifica sea un número válido si se envía
      if (updatePedidoDto.usuario_modifica !== undefined) {
        if (!updatePedidoDto.usuario_modifica || 
            isNaN(updatePedidoDto.usuario_modifica) || 
            updatePedidoDto.usuario_modifica <= 0) {
          throw new BadRequestException('El ID del usuario de modificación debe ser un número válido mayor a 0');
        }
        
        // Verificar que el usuario de modificación existe en la base de datos
        try {
          await this.usuarioService.findOne(updatePedidoDto.usuario_modifica);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException(`El usuario con ID ${updatePedidoDto.usuario_modifica} no existe o está inactivo`);
          }
          throw error;
        }
        
        pedido.usuario_modifica = updatePedidoDto.usuario_modifica;
      }

      // Validar que NO se envíen campos de solo lectura en actualización
      if ('usuario_ingreso' in updatePedidoDto) {
        throw new BadRequestException('El campo usuario_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('fecha_ingreso' in updatePedidoDto) {
        throw new BadRequestException('El campo fecha_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('estado' in updatePedidoDto) {
        throw new BadRequestException('El campo estado no se puede modificar. Use el endpoint de eliminación lógica.');
      }

      if ('id' in updatePedidoDto) {
        throw new BadRequestException('El campo id no se puede modificar. Es de solo lectura.');
      }
      
      pedido.fecha_modifica = new Date();
      const pedidoActualizado = await this.pedidoRepository.save(pedido);
      
      console.log(`Pedido con ID ${id} actualizado exitosamente`);
      return pedidoActualizado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException || 
          error instanceof ConflictException) {
        throw error;
      }
      console.error(`Error al actualizar pedido con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al actualizar pedido');
    }
  }

  // DELETE eliminación lógica (cambiar estado de true a false)
  async remove(id: number, usuarioModificaId: number): Promise<{ message: string }> {
    // Validar ID del pedido
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido debe ser un número válido mayor a 0');
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
      const pedido = await this.pedidoRepository.findOne({
        where: { id, estado: true }
      });

      if (!pedido) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado o inactivo`);
      }
      
      // Verificar si el pedido ya está inactivo
      if (!pedido.estado) {
        throw new BadRequestException(`El pedido con ID ${id} ya está inactivo`);
      }
      
      pedido.estado = false;
      pedido.usuario_modifica = usuarioModificaId;
      pedido.fecha_modifica = new Date();
      await this.pedidoRepository.save(pedido);
      
      console.log(`Pedido con ID ${id} eliminado lógicamente`);
      return { message: `Pedido con ID ${id} eliminado lógicamente` };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al eliminar pedido con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al eliminar pedido');
    }
  }

  // Métodos que nos pueden servir: Reactivar pedido
  async reactivate(id: number): Promise<IPedido> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del pedido debe ser un número válido mayor a 0');
    }

    try {
      const pedido = await this.pedidoRepository.findOne({
        where: { id }
      });

      if (!pedido) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
      }

      if (pedido.estado) {
        throw new BadRequestException(`El pedido con ID ${id} ya está activo`);
      }

      pedido.estado = true;
      pedido.fecha_modifica = new Date();
      const pedidoReactivado = await this.pedidoRepository.save(pedido);
      
      console.log(`Pedido con ID ${id} reactivado exitosamente`);
      return pedidoReactivado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al reactivar pedido con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al reactivar pedido');
    }
  }

  // Métodos que nos pueden servir: Buscar pedidos por código (búsqueda parcial)
  async searchByCodigo(codigo: string): Promise<IPedido[]> {
    if (!codigo || codigo.trim().length === 0) {
      throw new BadRequestException('El término de búsqueda no puede estar vacío');
    }

    if (codigo.trim().length < 2) {
      throw new BadRequestException('El término de búsqueda debe tener al menos 2 caracteres');
    }

    try {
      const pedidos = await this.pedidoRepository
        .createQueryBuilder('pedido')
        .where('pedido.codigo LIKE :codigo', { codigo: `%${codigo.trim()}%` })
        .andWhere('pedido.estado = :estado', { estado: true })
        .getMany();

      if (pedidos.length === 0) {
        console.log(`No se encontraron pedidos que coincidan con '${codigo}'`);
      }

      return pedidos;
    } catch (error) {
      console.error(`Error al buscar pedidos por código '${codigo}':`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedidos');
    }
  }

  // Métodos que nos pueden servir: Buscar pedidos por estado
  async findByEstado(estadoPedido: string): Promise<IPedido[]> {
    if (!estadoPedido || estadoPedido.trim().length === 0) {
      throw new BadRequestException('El estado del pedido no puede estar vacío');
    }

    try {
      const pedidos = await this.pedidoRepository.find({
        where: { 
          estado_pedido: estadoPedido.trim(),
          estado: true 
        }
      });

      if (pedidos.length === 0) {
        console.log(`No se encontraron pedidos con estado '${estadoPedido}'`);
      }

      return pedidos;
    } catch (error) {
      console.error(`Error al buscar pedidos por estado '${estadoPedido}':`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedidos por estado');
    }
  }

  // Métodos que nos pueden servir: Obtener pedidos por usuario que los creó
  async findByUsuarioIngreso(usuarioId: number): Promise<IPedido[]> {
    // Validar ID del usuario
    if (!usuarioId || isNaN(usuarioId) || usuarioId <= 0) {
      throw new BadRequestException('El ID del usuario debe ser un número válido mayor a 0');
    }

    try {
      const pedidos = await this.pedidoRepository.find({
        where: { 
          usuario_ingreso: usuarioId,
          estado: true 
        }
      });

      if (pedidos.length === 0) {
        console.log(`No se encontraron pedidos creados por el usuario con ID ${usuarioId}`);
      }

      return pedidos;
    } catch (error) {
      console.error(`Error al buscar pedidos por usuario ${usuarioId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar pedidos por usuario');
    }
  }

  // Métodos que nos pueden servir: Obtener estadísticas de pedidos
  async getStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    try {
      const [activos, inactivos] = await Promise.all([
        this.pedidoRepository.count({ where: { estado: true } }),
        this.pedidoRepository.count({ where: { estado: false } })
      ]);

      const total = activos + inactivos;
      
      console.log(`Estadísticas de pedidos: Total: ${total}, Activos: ${activos}, Inactivos: ${inactivos}`);
      
      return { total, activos, inactivos };
    } catch (error) {
      console.error('Error al obtener estadísticas de pedidos:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener estadísticas');
    }
  }

  // Métodos que nos pueden servir: Generar código único para pedido
  async generateUniqueCodigo(): Promise<string> {
    try {
      const timestamp = Date.now().toString();
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const codigo = `PED-${timestamp}-${randomSuffix}`;
      
      // Verificar que el código sea único
      const pedidoExistente = await this.pedidoRepository.findOne({
        where: { codigo }
      });

      if (pedidoExistente) {
        // Si existe, generar otro
        return this.generateUniqueCodigo();
      }

      return codigo;
    } catch (error) {
      console.error('Error al generar código único:', error);
      throw new InternalServerErrorException('Error interno del servidor al generar código único');
    }
  }
}
