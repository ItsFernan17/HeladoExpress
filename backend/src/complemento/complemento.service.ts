import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complemento } from './Entities/complemento.entity';
import { CreateComplementoDto } from './Dto/create-complemento.dto';
import { UpdateComplementoDto } from './Dto/update-complemento.dto';
import { IComplemento, ICreateComplemento, IUpdateComplemento } from './Interfaces/complemento.interface';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class ComplementoService {
  constructor(
    @InjectRepository(Complemento)
    private readonly complementoRepository: Repository<Complemento>,
    private readonly usuarioService: UsuarioService,
  ) {}

  // GET todos los complementos
  async findAll(): Promise<IComplemento[]> {
    try {
      const complementos = await this.complementoRepository.find({
        where: { estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (complementos.length === 0) {
        console.log('No se encontraron complementos activos');
      }
      
      return complementos;
    } catch (error) {
      console.error('Error al obtener complementos:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener complementos');
    }
  }

  // GET complemento por ID
  async findOne(id: number): Promise<IComplemento> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del complemento debe ser un número válido mayor a 0');
    }

    try {
      const complemento = await this.complementoRepository.findOne({
        where: { id, estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (!complemento) {
        throw new NotFoundException(`Complemento con ID ${id} no encontrado o inactivo`);
      }
      
      return complemento;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error al buscar complemento con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar complemento');
    }
  }

  // POST crear nuevo complemento
  async create(createComplementoDto: CreateComplementoDto): Promise<IComplemento> {
    // Validar que solo se envíen los campos permitidos para creación
    const camposPermitidos = ['nombre', 'precio', 'usuario_ingreso'];
    const camposEnviados = Object.keys(createComplementoDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en creación: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar DTO
    if (!createComplementoDto.nombre || createComplementoDto.nombre.trim().length === 0) {
      throw new BadRequestException('El nombre del complemento no puede estar vacío');
    }

    if (createComplementoDto.nombre.trim().length < 4) {
      throw new BadRequestException('El nombre del complemento debe tener al menos 4 caracteres');
    }

    if (createComplementoDto.nombre.trim().length > 50) {
      throw new BadRequestException('El nombre del complemento no puede exceder 50 caracteres');
    }

    if (!createComplementoDto.precio || createComplementoDto.precio < 0) {
      throw new BadRequestException('El precio debe ser un número mayor o igual a 0');
    }

    // Validar que usuario_ingreso sea un número válido
    if (!createComplementoDto.usuario_ingreso || 
        isNaN(createComplementoDto.usuario_ingreso) || 
        createComplementoDto.usuario_ingreso <= 0) {
      throw new BadRequestException('El ID del usuario de ingreso debe ser un número válido mayor a 0');
    }

    // Validar que NO se envíen campos incorrectos en creación
    if ('estado' in createComplementoDto) {
      throw new BadRequestException('El campo estado no se puede enviar en creación. Se establece automáticamente como true.');
    }

    if ('id' in createComplementoDto) {
      throw new BadRequestException('El campo id no se puede enviar en creación. Se genera automáticamente.');
    }

    if ('usuario_modifica' in createComplementoDto) {
      throw new BadRequestException('El campo usuario_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    if ('fecha_modifica' in createComplementoDto) {
      throw new BadRequestException('El campo fecha_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    try {
      // Verificar si ya existe un complemento con el mismo nombre
      const complementoExistente = await this.complementoRepository.findOne({
        where: { 
          nombre: createComplementoDto.nombre.trim(),
          estado: true 
        }
      });

      if (complementoExistente) {
        throw new ConflictException(`Ya existe un complemento activo con el nombre '${createComplementoDto.nombre}'`);
      }

      // Verificar que el usuario de ingreso existe
      try {
        await this.usuarioService.findOne(createComplementoDto.usuario_ingreso);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(`El usuario con ID ${createComplementoDto.usuario_ingreso} no existe o está inactivo`);
        }
        throw error;
      }

      const complemento = this.complementoRepository.create({
        nombre: createComplementoDto.nombre.trim(),
        precio: createComplementoDto.precio,
        usuario_ingreso: createComplementoDto.usuario_ingreso,
        estado: true,
        fecha_ingreso: new Date()
      });
      
      const complementoGuardado = await this.complementoRepository.save(complemento);
      console.log(`Complemento creado exitosamente con ID: ${complementoGuardado.id}`);
      
      return complementoGuardado;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al crear complemento:', error);
      throw new InternalServerErrorException('Error interno del servidor al crear complemento');
    }
  }

  // PUT actualizar complemento
  async update(id: number, updateComplementoDto: UpdateComplementoDto): Promise<IComplemento> {
    // Validar que solo se envíen los campos permitidos para actualización
    const camposPermitidos = ['nombre', 'precio', 'usuario_modifica'];
    const camposEnviados = Object.keys(updateComplementoDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en actualización: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del complemento debe ser un número válido mayor a 0');
    }

    try {
      const complemento = await this.complementoRepository.findOne({
        where: { id, estado: true }
      });

      if (!complemento) {
        throw new NotFoundException(`Complemento con ID ${id} no encontrado o inactivo`);
      }
      
      // Validar nombre si se va a actualizar
      if (updateComplementoDto.nombre !== undefined) {
        if (!updateComplementoDto.nombre || updateComplementoDto.nombre.trim().length === 0) {
          throw new BadRequestException('El nombre del complemento no puede estar vacío');
        }

        if (updateComplementoDto.nombre.trim().length < 4) {
          throw new BadRequestException('El nombre del complemento debe tener al menos 4 caracteres');
        }

        if (updateComplementoDto.nombre.trim().length > 50) {
          throw new BadRequestException('El nombre del complemento no puede exceder 50 caracteres');
        }

        // Verificar si ya existe otro complemento con el mismo nombre
        const complementoExistente = await this.complementoRepository.findOne({
          where: { 
            nombre: updateComplementoDto.nombre.trim(),
            estado: true
          }
        });

        if (complementoExistente && complementoExistente.id !== id) {
          throw new ConflictException(`Ya existe otro complemento activo con el nombre '${updateComplementoDto.nombre}'`);
        }

        complemento.nombre = updateComplementoDto.nombre.trim();
      }

      // Validar precio si se va a actualizar
      if (updateComplementoDto.precio !== undefined) {
        if (updateComplementoDto.precio < 0) {
          throw new BadRequestException('El precio no puede ser negativo');
        }
        complemento.precio = updateComplementoDto.precio;
      }
      
      // Validar que usuario_modifica sea un número válido si se envía
      if (updateComplementoDto.usuario_modifica !== undefined) {
        if (!updateComplementoDto.usuario_modifica || 
            isNaN(updateComplementoDto.usuario_modifica) || 
            updateComplementoDto.usuario_modifica <= 0) {
          throw new BadRequestException('El ID del usuario de modificación debe ser un número válido mayor a 0');
        }
        
        // Verificar que el usuario de modificación existe en la base de datos
        try {
          await this.usuarioService.findOne(updateComplementoDto.usuario_modifica);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException(`El usuario con ID ${updateComplementoDto.usuario_modifica} no existe o está inactivo`);
          }
          throw error;
        }
        
        complemento.usuario_modifica = updateComplementoDto.usuario_modifica;
      }

      // Validar que NO se envíen campos de solo lectura en actualización
      if ('usuario_ingreso' in updateComplementoDto) {
        throw new BadRequestException('El campo usuario_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('fecha_ingreso' in updateComplementoDto) {
        throw new BadRequestException('El campo fecha_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('estado' in updateComplementoDto) {
        throw new BadRequestException('El campo estado no se puede modificar. Use el endpoint de eliminación lógica.');
      }

      if ('id' in updateComplementoDto) {
        throw new BadRequestException('El campo id no se puede modificar. Es de solo lectura.');
      }
      
      complemento.fecha_modifica = new Date();
      const complementoActualizado = await this.complementoRepository.save(complemento);
      
      console.log(`Complemento con ID ${id} actualizado exitosamente`);
      return complementoActualizado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException || 
          error instanceof ConflictException) {
        throw error;
      }
      console.error(`Error al actualizar complemento con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al actualizar complemento');
    }
  }

  // DELETE eliminación lógica (cambiar estado de true a false)
  async remove(id: number, usuarioModificaId: number): Promise<{ message: string }> {
    // Validar ID del complemento
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del complemento debe ser un número válido mayor a 0');
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
      const complemento = await this.complementoRepository.findOne({
        where: { id, estado: true }
      });

      if (!complemento) {
        throw new NotFoundException(`Complemento con ID ${id} no encontrado o inactivo`);
      }
      
      // Verificar si el complemento ya está inactivo
      if (!complemento.estado) {
        throw new BadRequestException(`El complemento con ID ${id} ya está inactivo`);
      }
      
      complemento.estado = false;
      complemento.usuario_modifica = usuarioModificaId;
      complemento.fecha_modifica = new Date();
      await this.complementoRepository.save(complemento);
      
      console.log(`Complemento con ID ${id} eliminado lógicamente`);
      return { message: `Complemento con ID ${id} eliminado lógicamente` };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al eliminar complemento con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al eliminar complemento');
    }
  }

  // Métodos que nos pueden servir: Reactivar complemento
  async reactivate(id: number): Promise<IComplemento> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del complemento debe ser un número válido mayor a 0');
    }

    try {
      const complemento = await this.complementoRepository.findOne({
        where: { id }
      });

      if (!complemento) {
        throw new NotFoundException(`Complemento con ID ${id} no encontrado`);
      }

      if (complemento.estado) {
        throw new BadRequestException(`El complemento con ID ${id} ya está activo`);
      }

      complemento.estado = true;
      complemento.fecha_modifica = new Date();
      const complementoReactivado = await this.complementoRepository.save(complemento);
      
      console.log(`Complemento con ID ${id} reactivado exitosamente`);
      return complementoReactivado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al reactivar complemento con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al reactivar complemento');
    }
  }

  // Métodos que nos pueden servir: Buscar complementos por nombre (búsqueda parcial)
  async searchByName(nombre: string): Promise<IComplemento[]> {
    if (!nombre || nombre.trim().length === 0) {
      throw new BadRequestException('El término de búsqueda no puede estar vacío');
    }

    if (nombre.trim().length < 2) {
      throw new BadRequestException('El término de búsqueda debe tener al menos 2 caracteres');
    }

    try {
      const complementos = await this.complementoRepository
        .createQueryBuilder('complemento')
        .where('complemento.nombre LIKE :nombre', { nombre: `%${nombre.trim()}%` })
        .andWhere('complemento.estado = :estado', { estado: true })
        .getMany();

      if (complementos.length === 0) {
        console.log(`No se encontraron complementos que coincidan con '${nombre}'`);
      }

      return complementos;
    } catch (error) {
      console.error(`Error al buscar complementos por nombre '${nombre}':`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar complementos');
    }
  }

  // Métodos que nos pueden servir: Buscar complementos por rango de precio
  async findByPrecioRange(precioMin: number, precioMax: number): Promise<IComplemento[]> {
    if (precioMin < 0 || precioMax < 0) {
      throw new BadRequestException('Los precios no pueden ser negativos');
    }

    if (precioMin > precioMax) {
      throw new BadRequestException('El precio mínimo no puede ser mayor al precio máximo');
    }

    try {
      const complementos = await this.complementoRepository
        .createQueryBuilder('complemento')
        .where('complemento.precio >= :precioMin', { precioMin })
        .andWhere('complemento.precio <= :precioMax', { precioMax })
        .andWhere('complemento.estado = :estado', { estado: true })
        .getMany();

      if (complementos.length === 0) {
        console.log(`No se encontraron complementos en el rango de precio ${precioMin} - ${precioMax}`);
      }

      return complementos;
    } catch (error) {
      console.error(`Error al buscar complementos por rango de precio ${precioMin} - ${precioMax}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar complementos por precio');
    }
  }

  // Métodos que nos pueden servir: Obtener complementos por usuario que los creó
  async findByUsuarioIngreso(usuarioId: number): Promise<IComplemento[]> {
    // Validar ID del usuario
    if (!usuarioId || isNaN(usuarioId) || usuarioId <= 0) {
      throw new BadRequestException('El ID del usuario debe ser un número válido mayor a 0');
    }

    try {
      const complementos = await this.complementoRepository.find({
        where: { 
          usuario_ingreso: usuarioId,
          estado: true 
        }
      });

      if (complementos.length === 0) {
        console.log(`No se encontraron complementos creados por el usuario con ID ${usuarioId}`);
      }

      return complementos;
    } catch (error) {
      console.error(`Error al buscar complementos por usuario ${usuarioId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar complementos por usuario');
    }
  }

  // Métodos que nos pueden servir: Obtener estadísticas de complementos
  async getStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    try {
      const [activos, inactivos] = await Promise.all([
        this.complementoRepository.count({ where: { estado: true } }),
        this.complementoRepository.count({ where: { estado: false } })
      ]);

      const total = activos + inactivos;
      
      console.log(`Estadísticas de complementos: Total: ${total}, Activos: ${activos}, Inactivos: ${inactivos}`);
      
      return { total, activos, inactivos };
    } catch (error) {
      console.error('Error al obtener estadísticas de complementos:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener estadísticas');
    }
  }

  // Métodos que nos pueden servir: Obtener complementos más caros
  async getMostExpensive(limit: number = 5): Promise<IComplemento[]> {
    if (limit <= 0 || limit > 50) {
      throw new BadRequestException('El límite debe ser un número entre 1 y 50');
    }

    try {
      const complementos = await this.complementoRepository
        .createQueryBuilder('complemento')
        .where('complemento.estado = :estado', { estado: true })
        .orderBy('complemento.precio', 'DESC')
        .limit(limit)
        .getMany();

      if (complementos.length === 0) {
        console.log('No se encontraron complementos activos');
      }

      return complementos;
    } catch (error) {
      console.error(`Error al obtener los ${limit} complementos más caros:`, error);
      throw new InternalServerErrorException('Error interno del servidor al obtener complementos más caros');
    }
  }
}
