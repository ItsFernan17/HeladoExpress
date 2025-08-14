import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Sabor } from './Entities/sabor.entity';
import { CreateSaborDto } from './Dto/create-sabor.dto';
import { UpdateSaborDto } from './Dto/update-sabor.dto';
import { ISabor, ICreateSabor, IUpdateSabor } from './Interfaces/sabor.interface';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class SaborService {
  constructor(
    @InjectRepository(Sabor)
    private readonly saborRepository: Repository<Sabor>,
    private readonly usuarioService: UsuarioService,
  ) {}

  // GET todos los sabores (con campos de auditoría)
  async findAll(): Promise<ISabor[]> {
    try {
      const sabores = await this.saborRepository.find({
        where: { estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (sabores.length === 0) {
        console.log('No se encontraron sabores activos');
      }
      
      return sabores;
    } catch (error) {
      console.error('Error al obtener sabores:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener sabores');
    }
  }

  // GET sabor por ID (con campos de auditoría)
  async findOne(id: number): Promise<ISabor> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del sabor debe ser un número válido mayor a 0');
    }

    try {
      const sabor = await this.saborRepository.findOne({
        where: { id, estado: true },
        relations: { usuario_ingreso: true, usuario_modifica: true }
      });
      
      if (!sabor) {
        throw new NotFoundException(`Sabor con ID ${id} no encontrado o inactivo`);
      }
      
      return sabor;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error al buscar sabor con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar sabor');
    }
  }

  // POST crear nuevo sabor
  async create(createSaborDto: CreateSaborDto): Promise<ISabor> {
    // Validar que solo se envíen los campos permitidos para creación
    const camposPermitidos = ['nombre', 'usuario_ingreso'];
    const camposEnviados = Object.keys(createSaborDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en creación: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar DTO
    if (!createSaborDto.nombre || createSaborDto.nombre.trim().length === 0) {
      throw new BadRequestException('El nombre del sabor no puede estar vacío');
    }

    if (createSaborDto.nombre.trim().length < 4) {
      throw new BadRequestException('El nombre del sabor debe tener al menos 4 caracteres');
    }

    if (createSaborDto.nombre.trim().length > 50) {
      throw new BadRequestException('El nombre del sabor no puede exceder 50 caracteres');
    }

    // Validar que usuario_ingreso sea un número válido
    if (!createSaborDto.usuario_ingreso || 
        isNaN(createSaborDto.usuario_ingreso) || 
        createSaborDto.usuario_ingreso <= 0) {
      throw new BadRequestException('El ID del usuario de ingreso debe ser un número válido mayor a 0');
    }

    // Validar que NO se envíen campos incorrectos en creación
    if ('usuario_modifica' in createSaborDto) {
      throw new BadRequestException('El campo usuario_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    if ('fecha_modifica' in createSaborDto) {
      throw new BadRequestException('El campo fecha_modifica no se puede enviar en creación. Solo se establece en actualización.');
    }

    if ('estado' in createSaborDto) {
      throw new BadRequestException('El campo estado no se puede enviar en creación. Se establece automáticamente como true.');
    }

    if ('id' in createSaborDto) {
      throw new BadRequestException('El campo id no se puede enviar en creación. Se genera automáticamente.');
    }

    try {
      // Verificar que el usuario de ingreso existe
      try {
        await this.usuarioService.findOne(createSaborDto.usuario_ingreso);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(`El usuario con ID ${createSaborDto.usuario_ingreso} no existe o está inactivo`);
        }
        throw error;
      }

      // Verificar si ya existe un sabor con el mismo nombre
      const saborExistente = await this.saborRepository.findOne({
        where: { 
          nombre: createSaborDto.nombre.trim(),
          estado: true 
        }
      });

      if (saborExistente) {
        throw new ConflictException(`Ya existe un sabor activo con el nombre '${createSaborDto.nombre}'`);
      }

      const sabor = this.saborRepository.create({
        nombre: createSaborDto.nombre.trim(),
        usuario_ingreso: createSaborDto.usuario_ingreso,
        estado: true,
        fecha_ingreso: new Date()
        // usuario_modifica y fecha_modifica se dejan como null por defecto
      });
      
      const saborGuardado = await this.saborRepository.save(sabor);
      console.log(`Sabor creado exitosamente con ID: ${saborGuardado.id}`);
      
      return saborGuardado;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error al crear sabor:', error);
      throw new InternalServerErrorException('Error interno del servidor al crear sabor');
    }
  }

  // PUT actualizar sabor
  async update(id: number, updateSaborDto: UpdateSaborDto): Promise<ISabor> {
    // Validar que solo se envíen los campos permitidos para actualización
    const camposPermitidos = ['nombre', 'usuario_modifica'];
    const camposEnviados = Object.keys(updateSaborDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en actualización: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del sabor debe ser un número válido mayor a 0');
    }

    try {
      const sabor = await this.saborRepository.findOne({
        where: { id, estado: true }
      });

      if (!sabor) {
        throw new NotFoundException(`Sabor con ID ${id} no encontrado o inactivo`);
      }
      
      // Validar nombre si se va a actualizar
      if (updateSaborDto.nombre !== undefined) {
        if (!updateSaborDto.nombre || updateSaborDto.nombre.trim().length === 0) {
          throw new BadRequestException('El nombre del sabor no puede estar vacío');
        }

        if (updateSaborDto.nombre.trim().length < 4) {
          throw new BadRequestException('El nombre del sabor debe tener al menos 4 caracteres');
        }

        if (updateSaborDto.nombre.trim().length > 50) {
          throw new BadRequestException('El nombre del sabor no puede exceder 50 caracteres');
        }

        // Verificar si ya existe otro sabor con el mismo nombre
        const saborExistente = await this.saborRepository.findOne({
          where: { 
            nombre: updateSaborDto.nombre.trim(),
            estado: true
          }
        });

        if (saborExistente && saborExistente.id !== id) {
          throw new ConflictException(`Ya existe otro sabor activo con el nombre '${updateSaborDto.nombre}'`);
        }

        sabor.nombre = updateSaborDto.nombre.trim();
      }
      
      // Validar que usuario_modifica sea un número válido si se envía
      if (updateSaborDto.usuario_modifica !== undefined) {
        if (!updateSaborDto.usuario_modifica || 
            isNaN(updateSaborDto.usuario_modifica) || 
            updateSaborDto.usuario_modifica <= 0) {
          throw new BadRequestException('El ID del usuario de modificación debe ser un número válido mayor a 0');
        }
        
        // Verificar que el usuario de modificación existe en la base de datos
        try {
          await this.usuarioService.findOne(updateSaborDto.usuario_modifica);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException(`El usuario con ID ${updateSaborDto.usuario_modifica} no existe o está inactivo`);
          }
          throw error;
        }
        
        sabor.usuario_modifica = updateSaborDto.usuario_modifica;
      }

      // Validar que NO se envíen campos de solo lectura en actualización
      if ('usuario_ingreso' in updateSaborDto) {
        throw new BadRequestException('El campo usuario_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('fecha_ingreso' in updateSaborDto) {
        throw new BadRequestException('El campo fecha_ingreso no se puede modificar. Es de solo lectura.');
      }

      if ('estado' in updateSaborDto) {
        throw new BadRequestException('El campo estado no se puede modificar. Use el endpoint de eliminación lógica.');
      }
      
      sabor.fecha_modifica = new Date();
      const saborActualizado = await this.saborRepository.save(sabor);
      
      console.log(`Sabor con ID ${id} actualizado exitosamente`);
      return saborActualizado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException || 
          error instanceof ConflictException) {
        throw error;
      }
      console.error(`Error al actualizar sabor con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al actualizar sabor');
    }
  }

  // DELETE eliminación lógica (cambiar estado de true a false)
  async remove(id: number, usuarioModificaId: number): Promise<{ message: string }> {
    // Validar ID del sabor
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del sabor debe ser un número válido mayor a 0');
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
      const sabor = await this.saborRepository.findOne({
        where: { id, estado: true }
      });

      if (!sabor) {
        throw new NotFoundException(`Sabor con ID ${id} no encontrado o inactivo`);
      }
      
      // Verificar si el sabor ya está inactivo
      if (!sabor.estado) {
        throw new BadRequestException(`El sabor con ID ${id} ya está inactivo`);
      }
      
      sabor.estado = false;
      sabor.usuario_modifica = usuarioModificaId;
      sabor.fecha_modifica = new Date();
      await this.saborRepository.save(sabor);
      
      console.log(`Sabor con ID ${id} eliminado lógicamente`);
      return { message: `Sabor con ID ${id} eliminado lógicamente` };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al eliminar sabor con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al eliminar sabor');
    }
  }

  // Métodos que nos pueden servir: Reactivar sabor
  async reactivate(id: number): Promise<ISabor> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del sabor debe ser un número válido mayor a 0');
    }

    try {
      const sabor = await this.saborRepository.findOne({
        where: { id }
      });

      if (!sabor) {
        throw new NotFoundException(`Sabor con ID ${id} no encontrado`);
      }

      if (sabor.estado) {
        throw new BadRequestException(`El sabor con ID ${id} ya está activo`);
      }

      sabor.estado = true;
      sabor.fecha_modifica = new Date();
      const saborReactivado = await this.saborRepository.save(sabor);
      
      console.log(`Sabor con ID ${id} reactivado exitosamente`);
      return saborReactivado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al reactivar sabor con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al reactivar sabor');
    }
  }

  // Métodos que nos pueden servir: Buscar sabores por nombre (búsqueda parcial)
  async searchByName(nombre: string): Promise<ISabor[]> {
    if (!nombre || nombre.trim().length === 0) {
      throw new BadRequestException('El término de búsqueda no puede estar vacío');
    }

    if (nombre.trim().length < 2) {
      throw new BadRequestException('El término de búsqueda debe tener al menos 2 caracteres');
    }

    try {
      const sabores = await this.saborRepository
        .createQueryBuilder('sabor')
        .where('sabor.nombre LIKE :nombre', { nombre: `%${nombre.trim()}%` })
        .andWhere('sabor.estado = :estado', { estado: true })
        .getMany();

      if (sabores.length === 0) {
        console.log(`No se encontraron sabores que coincidan con '${nombre}'`);
      }

      return sabores;
    } catch (error) {
      console.error(`Error al buscar sabores por nombre '${nombre}':`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar sabores');
    }
  }

  // Métodos que nos pueden servir: Obtener sabores por usuario que los creó
  async findByUsuarioIngreso(usuarioId: number): Promise<ISabor[]> {
    // Validar ID del usuario
    if (!usuarioId || isNaN(usuarioId) || usuarioId <= 0) {
      throw new BadRequestException('El ID del usuario debe ser un número válido mayor a 0');
    }

    try {
      const sabores = await this.saborRepository.find({
        where: { 
          usuario_ingreso: usuarioId,
          estado: true 
        }
      });

      if (sabores.length === 0) {
        console.log(`No se encontraron sabores creados por el usuario con ID ${usuarioId}`);
      }

      return sabores;
    } catch (error) {
      console.error(`Error al buscar sabores por usuario ${usuarioId}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar sabores por usuario');
    }
  }

  // Métodos que nos pueden servir: Obtener estadísticas de sabores
  async getStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    try {
      const [activos, inactivos] = await Promise.all([
        this.saborRepository.count({ where: { estado: true } }),
        this.saborRepository.count({ where: { estado: false } })
      ]);

      const total = activos + inactivos;
      
      console.log(`Estadísticas de sabores: Total: ${total}, Activos: ${activos}, Inactivos: ${inactivos}`);
      
      return { total, activos, inactivos };
    } catch (error) {
      console.error('Error al obtener estadísticas de sabores:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener estadísticas');
    }
  }
}
