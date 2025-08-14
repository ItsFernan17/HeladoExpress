import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoHelado } from './Entities/tipo-helado.entity';
import { CreateTipoHeladoDto } from './Dto/create-tipo-helado.dto';
import { UpdateTipoHeladoDto } from './Dto/update-tipo-helado.dto';
import { ITipoHelado, ICreateTipoHelado, IUpdateTipoHelado } from './Interfaces/tipo-helado.interface';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class TipoHeladoService {
  constructor(
    @InjectRepository(TipoHelado)
    private readonly tipoHeladoRepository: Repository<TipoHelado>,
    private readonly usuarioService: UsuarioService,
  ) {}

  // GET todos los tipos de helado
  async findAll(): Promise<ITipoHelado[]> {
    try {
      const tiposHelado = await this.tipoHeladoRepository.find({
        where: { estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (tiposHelado.length === 0) {
        console.log('No se encontraron tipos de helado activos');
      }
      
      return tiposHelado;
    } catch (error) {
      console.error('Error al obtener tipos de helado:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener tipos de helado');
    }
  }

  // GET tipo de helado por ID
  async findOne(id: number): Promise<ITipoHelado> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del tipo de helado debe ser un número válido mayor a 0');
    }

    try {
      const tipoHelado = await this.tipoHeladoRepository.findOne({
        where: { id, estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (!tipoHelado) {
        throw new NotFoundException(`Tipo de helado con ID ${id} no encontrado o inactivo`);
      }
      
      return tipoHelado;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error al buscar tipo de helado con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar tipo de helado');
    }
  }

  // POST crear nuevo tipo de helado
  async create(createTipoHeladoDto: CreateTipoHeladoDto): Promise<ITipoHelado> {
    // Validar que solo se envíen los campos permitidos para creación
    const camposPermitidos = ['nombre', 'descripcion', 'max_bolas', 'precio_base', 'precio_bola_adicional', 'permite_complemento', 'usuario_ingreso'];
    const camposEnviados = Object.keys(createTipoHeladoDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en creación: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar DTO
    if (!createTipoHeladoDto.nombre || createTipoHeladoDto.nombre.trim().length === 0) {
      throw new BadRequestException('El nombre del tipo de helado no puede estar vacío');
    }

    if (createTipoHeladoDto.nombre.trim().length < 3) {
      throw new BadRequestException('El nombre del tipo de helado debe tener al menos 3 caracteres');
    }

    if (createTipoHeladoDto.nombre.trim().length > 100) {
      throw new BadRequestException('El nombre del tipo de helado no puede exceder 100 caracteres');
    }

    if (!createTipoHeladoDto.max_bolas || createTipoHeladoDto.max_bolas < 1 || createTipoHeladoDto.max_bolas > 10) {
      throw new BadRequestException('El máximo de bolas debe ser un número entre 1 y 10');
    }

    if (!createTipoHeladoDto.precio_base || createTipoHeladoDto.precio_base < 0) {
      throw new BadRequestException('El precio base debe ser un número mayor o igual a 0');
    }

    if (createTipoHeladoDto.precio_bola_adicional !== undefined && createTipoHeladoDto.precio_bola_adicional < 0) {
      throw new BadRequestException('El precio por bola adicional no puede ser negativo');
    }

    // Validar que usuario_ingreso sea un número válido
    if (!createTipoHeladoDto.usuario_ingreso || 
        isNaN(createTipoHeladoDto.usuario_ingreso) || 
        createTipoHeladoDto.usuario_ingreso <= 0) {
      throw new BadRequestException('El ID del usuario de ingreso debe ser un número válido mayor a 0');
    }

    // Validar que NO se envíen campos incorrectos en creación
    if ('estado' in createTipoHeladoDto) {
      throw new BadRequestException('El campo estado no se puede enviar en creación. Se establece automáticamente como true.');
    }

    if ('id' in createTipoHeladoDto) {
      throw new BadRequestException('El campo id no se puede enviar en creación. Se genera automáticamente.');
    }

    if ('usuario_modifica' in createTipoHeladoDto) {
      throw new BadRequestException('El campo usuario_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    if ('fecha_modifica' in createTipoHeladoDto) {
      throw new BadRequestException('El campo fecha_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    try {
      // Verificar si ya existe un tipo de helado con el mismo nombre
      const tipoHeladoExistente = await this.tipoHeladoRepository.findOne({
        where: { 
          nombre: createTipoHeladoDto.nombre.trim(),
          estado: true 
        }
      });

      if (tipoHeladoExistente) {
        throw new ConflictException(`Ya existe un tipo de helado activo con el nombre '${createTipoHeladoDto.nombre}'`);
      }

      // Verificar que el usuario de ingreso existe
      try {
        await this.usuarioService.findOne(createTipoHeladoDto.usuario_ingreso);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(`El usuario con ID ${createTipoHeladoDto.usuario_ingreso} no existe o está inactivo`);
        }
        throw error;
      }

      const tipoHelado = this.tipoHeladoRepository.create({
        nombre: createTipoHeladoDto.nombre.trim(),
        descripcion: createTipoHeladoDto.descripcion?.trim(),
        max_bolas: createTipoHeladoDto.max_bolas,
        precio_base: createTipoHeladoDto.precio_base,
        precio_bola_adicional: createTipoHeladoDto.precio_bola_adicional || 0,
        permite_complemento: createTipoHeladoDto.permite_complemento !== undefined ? createTipoHeladoDto.permite_complemento : true,
        usuario_ingreso: createTipoHeladoDto.usuario_ingreso,
        estado: true,
        fecha_ingreso: new Date()
      });
      
      const tipoHeladoGuardado = await this.tipoHeladoRepository.save(tipoHelado);
      console.log(`Tipo de helado creado exitosamente con ID: ${tipoHeladoGuardado.id}`);
      
      return tipoHeladoGuardado;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al crear tipo de helado:', error);
      throw new InternalServerErrorException('Error interno del servidor al crear tipo de helado');
    }
  }

  // PUT actualizar tipo de helado
  async update(id: number, updateTipoHeladoDto: UpdateTipoHeladoDto): Promise<ITipoHelado> {
    // Validar que solo se envíen los campos permitidos para actualización
    const camposPermitidos = ['nombre', 'descripcion', 'max_bolas', 'precio_base', 'precio_bola_adicional', 'permite_complemento', 'usuario_modifica'];
    const camposEnviados = Object.keys(updateTipoHeladoDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en actualización: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del tipo de helado debe ser un número válido mayor a 0');
    }

    try {
      const tipoHelado = await this.tipoHeladoRepository.findOne({
        where: { id, estado: true }
      });

      if (!tipoHelado) {
        throw new NotFoundException(`Tipo de helado con ID ${id} no encontrado o inactivo`);
      }
      
      // Validar nombre si se va a actualizar
      if (updateTipoHeladoDto.nombre !== undefined) {
        if (!updateTipoHeladoDto.nombre || updateTipoHeladoDto.nombre.trim().length === 0) {
          throw new BadRequestException('El nombre del tipo de helado no puede estar vacío');
        }

        if (updateTipoHeladoDto.nombre.trim().length < 3) {
          throw new BadRequestException('El nombre del tipo de helado debe tener al menos 3 caracteres');
        }

        if (updateTipoHeladoDto.nombre.trim().length > 100) {
          throw new BadRequestException('El nombre del tipo de helado no puede exceder 100 caracteres');
        }

        // Verificar si ya existe otro tipo de helado con el mismo nombre
        const tipoHeladoExistente = await this.tipoHeladoRepository.findOne({
          where: { 
            nombre: updateTipoHeladoDto.nombre.trim(),
            estado: true
          }
        });

        if (tipoHeladoExistente && tipoHeladoExistente.id !== id) {
          throw new ConflictException(`Ya existe otro tipo de helado activo con el nombre '${updateTipoHeladoDto.nombre}'`);
        }

        tipoHelado.nombre = updateTipoHeladoDto.nombre.trim();
      }

      // Validar descripción si se va a actualizar
      if (updateTipoHeladoDto.descripcion !== undefined) {
        if (updateTipoHeladoDto.descripcion && updateTipoHeladoDto.descripcion.trim().length > 1000) {
          throw new BadRequestException('La descripción no debe exceder 1000 caracteres');
        }
        tipoHelado.descripcion = updateTipoHeladoDto.descripcion?.trim();
      }

      // Validar max_bolas si se va a actualizar
      if (updateTipoHeladoDto.max_bolas !== undefined) {
        if (updateTipoHeladoDto.max_bolas < 1 || updateTipoHeladoDto.max_bolas > 10) {
          throw new BadRequestException('El máximo de bolas debe ser un número entre 1 y 10');
        }
        tipoHelado.max_bolas = updateTipoHeladoDto.max_bolas;
      }

      // Validar precio_base si se va a actualizar
      if (updateTipoHeladoDto.precio_base !== undefined) {
        if (updateTipoHeladoDto.precio_base < 0) {
          throw new BadRequestException('El precio base no puede ser negativo');
        }
        tipoHelado.precio_base = updateTipoHeladoDto.precio_base;
      }

      // Validar precio_bola_adicional si se va a actualizar
      if (updateTipoHeladoDto.precio_bola_adicional !== undefined) {
        if (updateTipoHeladoDto.precio_bola_adicional < 0) {
          throw new BadRequestException('El precio por bola adicional no puede ser negativo');
        }
        tipoHelado.precio_bola_adicional = updateTipoHeladoDto.precio_bola_adicional;
      }

      // Validar permite_complemento si se va a actualizar
      if (updateTipoHeladoDto.permite_complemento !== undefined) {
        tipoHelado.permite_complemento = updateTipoHeladoDto.permite_complemento;
      }
      
      // Validar que usuario_modifica sea un número válido si se envía
      if (updateTipoHeladoDto.usuario_modifica !== undefined) {
        if (!updateTipoHeladoDto.usuario_modifica || 
            isNaN(updateTipoHeladoDto.usuario_modifica) || 
            updateTipoHeladoDto.usuario_modifica <= 0) {
          throw new BadRequestException('El ID del usuario de modificación debe ser un número válido mayor a 0');
        }
        
        // Verificar que el usuario de modificación existe en la base de datos
        try {
          await this.usuarioService.findOne(updateTipoHeladoDto.usuario_modifica);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException(`El usuario con ID ${updateTipoHeladoDto.usuario_modifica} no existe o está inactivo`);
          }
          throw error;
        }
        
        tipoHelado.usuario_modifica = updateTipoHeladoDto.usuario_modifica;
      }

      // Validar que NO se envíen campos de solo lectura en actualización
      if ('usuario_ingreso' in updateTipoHeladoDto) {
        throw new BadRequestException('El campo usuario_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('fecha_ingreso' in updateTipoHeladoDto) {
        throw new BadRequestException('El campo fecha_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('estado' in updateTipoHeladoDto) {
        throw new BadRequestException('El campo estado no se puede modificar. Use el endpoint de eliminación lógica.');
      }

      if ('id' in updateTipoHeladoDto) {
        throw new BadRequestException('El campo id no se puede modificar. Es de solo lectura.');
      }
      
      tipoHelado.fecha_modifica = new Date();
      const tipoHeladoActualizado = await this.tipoHeladoRepository.save(tipoHelado);
      
      console.log(`Tipo de helado con ID ${id} actualizado exitosamente`);
      return tipoHeladoActualizado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException || 
          error instanceof ConflictException) {
        throw error;
      }
      console.error(`Error al actualizar tipo de helado con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al actualizar tipo de helado');
    }
  }

  // DELETE eliminación lógica (cambiar estado de true a false)
  async remove(id: number, usuarioModificaId: number): Promise<{ message: string }> {
    // Validar ID del tipo de helado
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del tipo de helado debe ser un número válido mayor a 0');
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
      const tipoHelado = await this.tipoHeladoRepository.findOne({
        where: { id, estado: true }
      });

      if (!tipoHelado) {
        throw new NotFoundException(`Tipo de helado con ID ${id} no encontrado o inactivo`);
      }
      
      // Verificar si el tipo de helado ya está inactivo
      if (!tipoHelado.estado) {
        throw new BadRequestException(`El tipo de helado con ID ${id} ya está inactivo`);
      }
      
      tipoHelado.estado = false;
      tipoHelado.usuario_modifica = usuarioModificaId;
      tipoHelado.fecha_modifica = new Date();
      await this.tipoHeladoRepository.save(tipoHelado);
      
      console.log(`Tipo de helado con ID ${id} eliminado lógicamente`);
      return { message: `Tipo de helado con ID ${id} eliminado lógicamente` };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al eliminar tipo de helado con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al eliminar tipo de helado');
    }
  }

  // Métodos que nos pueden servir: Reactivar tipo de helado
  async reactivate(id: number): Promise<ITipoHelado> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del tipo de helado debe ser un número válido mayor a 0');
    }

    try {
      const tipoHelado = await this.tipoHeladoRepository.findOne({
        where: { id }
      });

      if (!tipoHelado) {
        throw new NotFoundException(`Tipo de helado con ID ${id} no encontrado`);
      }

      if (tipoHelado.estado) {
        throw new BadRequestException(`El tipo de helado con ID ${id} ya está activo`);
      }

      tipoHelado.estado = true;
      tipoHelado.fecha_modifica = new Date();
      const tipoHeladoReactivado = await this.tipoHeladoRepository.save(tipoHelado);
      
      console.log(`Tipo de helado con ID ${id} reactivado exitosamente`);
      return tipoHeladoReactivado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al reactivar tipo de helado con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al reactivar tipo de helado');
    }
  }

  // Métodos que nos pueden servir: Buscar tipos de helado por nombre (búsqueda parcial)
  async searchByName(nombre: string): Promise<ITipoHelado[]> {
    if (!nombre || nombre.trim().length === 0) {
      throw new BadRequestException('El término de búsqueda no puede estar vacío');
    }

    if (nombre.trim().length < 2) {
      throw new BadRequestException('El término de búsqueda debe tener al menos 2 caracteres');
    }

    try {
      const tiposHelado = await this.tipoHeladoRepository
        .createQueryBuilder('tipoHelado')
        .where('tipoHelado.nombre LIKE :nombre', { nombre: `%${nombre.trim()}%` })
        .andWhere('tipoHelado.estado = :estado', { estado: true })
        .getMany();

      if (tiposHelado.length === 0) {
        console.log(`No se encontraron tipos de helado que coincidan con '${nombre}'`);
      }

      return tiposHelado;
    } catch (error) {
      console.error(`Error al buscar tipos de helado por nombre '${nombre}':`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar tipos de helado');
    }
  }

  // Métodos que nos pueden servir: Obtener tipos de helado por usuario que los creó
  async findByUsuarioIngreso(usuarioId: number): Promise<ITipoHelado[]> {
    // Validar ID del usuario
    if (!usuarioId || isNaN(usuarioId) || usuarioId <= 0) {
      throw new BadRequestException('El ID del usuario debe ser un número válido mayor a 0');
    }

    try {
      const tiposHelado = await this.tipoHeladoRepository.find({
        where: { 
          usuario_ingreso: usuarioId,
          estado: true 
        }
      });

      if (tiposHelado.length === 0) {
        console.log(`No se encontraron tipos de helado creados por el usuario con ID ${usuarioId}`);
      }

      return tiposHelado;
    } catch (error) {
      console.error(`Error al buscar tipos de helado por usuario ${usuarioId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar tipos de helado por usuario');
    }
  }

  // Métodos que nos pueden servir: Obtener estadísticas de tipos de helado
  async getStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    try {
      const [activos, inactivos] = await Promise.all([
        this.tipoHeladoRepository.count({ where: { estado: true } }),
        this.tipoHeladoRepository.count({ where: { estado: false } })
      ]);

      const total = activos + inactivos;
      
      console.log(`Estadísticas de tipos de helado: Total: ${total}, Activos: ${activos}, Inactivos: ${inactivos}`);
      
      return { total, activos, inactivos };
    } catch (error) {
      console.error('Error al obtener estadísticas de tipos de helado:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener estadísticas');
    }
  }
}
