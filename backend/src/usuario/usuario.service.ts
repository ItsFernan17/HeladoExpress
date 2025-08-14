import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './Entities/usuario.entity';
import { CreateUsuarioDto } from './Dto/create-usuario.dto';
import { UpdateUsuarioDto } from './Dto/update-usuario.dto';
import { IUsuario, ICreateUsuario, IUpdateUsuario } from './Interfaces/usuario.interface';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  // GET todos los usuarios
  async findAll(): Promise<IUsuario[]> {
    try {
      const usuarios = await this.usuarioRepository.find({
        where: { estado: true }
      });
      
      if (usuarios.length === 0) {
        console.log('No se encontraron usuarios activos');
      }
      
      return usuarios;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw new InternalServerErrorException('Error interno del servidor al obtener usuarios');
    }
  }

  // GET usuario por ID
  async findOne(id: number): Promise<IUsuario> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del usuario debe ser un número válido mayor a 0');
    }

    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id, estado: true }
      });
      
      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado o inactivo`);
      }
      
      return usuario;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error al buscar usuario con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar usuario');
    }
  }

  // POST crear nuevo usuario
  async create(createUsuarioDto: CreateUsuarioDto): Promise<IUsuario> {
    // Validar que solo se envíen los campos permitidos para creación
    const camposPermitidos = ['nombre'];
    const camposEnviados = Object.keys(createUsuarioDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en creación: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar DTO
    if (!createUsuarioDto.nombre || createUsuarioDto.nombre.trim().length === 0) {
      throw new BadRequestException('El nombre del usuario no puede estar vacío');
    }

    if (createUsuarioDto.nombre.trim().length < 4) {
      throw new BadRequestException('El nombre del usuario debe tener al menos 4 caracteres');
    }

    if (createUsuarioDto.nombre.trim().length > 50) {
      throw new BadRequestException('El nombre del usuario no puede exceder 50 caracteres');
    }

    // Validar que NO se envíen campos incorrectos en creación
    if ('estado' in createUsuarioDto) {
      throw new BadRequestException('El campo estado no se puede enviar en creación. Se establece automáticamente como true.');
    }

    if ('id' in createUsuarioDto) {
      throw new BadRequestException('El campo id no se puede enviar en creación. Se genera automáticamente.');
    }

    try {
      // Verificar si ya existe un usuario con el mismo nombre
      const usuarioExistente = await this.usuarioRepository.findOne({
        where: { 
          nombre: createUsuarioDto.nombre.trim(),
          estado: true 
        }
      });

      if (usuarioExistente) {
        throw new ConflictException(`Ya existe un usuario activo con el nombre '${createUsuarioDto.nombre}'`);
      }

      const usuario = this.usuarioRepository.create({
        nombre: createUsuarioDto.nombre.trim(),
        estado: true
      });
      
      const usuarioGuardado = await this.usuarioRepository.save(usuario);
      console.log(`Usuario creado exitosamente con ID: ${usuarioGuardado.id}`);
      
      return usuarioGuardado;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error al crear usuario:', error);
      throw new InternalServerErrorException('Error interno del servidor al crear usuario');
    }
  }

  // PUT actualizar usuario
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<IUsuario> {
    // Validar que solo se envíen los campos permitidos para actualización
    const camposPermitidos = ['nombre'];
    const camposEnviados = Object.keys(updateUsuarioDto);
    const camposNoPermitidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposNoPermitidos.length > 0) {
      throw new BadRequestException(`Campos no permitidos en actualización: ${camposNoPermitidos.join(', ')}. Solo se permiten: ${camposPermitidos.join(', ')}`);
    }

    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del usuario debe ser un número válido mayor a 0');
    }

    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id, estado: true }
      });

      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado o inactivo`);
      }
      
      // Validar nombre si se va a actualizar
      if (updateUsuarioDto.nombre !== undefined) {
        if (!updateUsuarioDto.nombre || updateUsuarioDto.nombre.trim().length === 0) {
          throw new BadRequestException('El nombre del usuario no puede estar vacío');
        }

        if (updateUsuarioDto.nombre.trim().length < 4) {
          throw new BadRequestException('El nombre del usuario debe tener al menos 4 caracteres');
        }

        if (updateUsuarioDto.nombre.trim().length > 50) {
          throw new BadRequestException('El nombre del usuario no puede exceder 50 caracteres');
        }

        // Verificar si ya existe otro usuario con el mismo nombre
        const usuarioExistente = await this.usuarioRepository.findOne({
          where: { 
            nombre: updateUsuarioDto.nombre.trim(),
            estado: true
          }
        });

        if (usuarioExistente && usuarioExistente.id !== id) {
          throw new ConflictException(`Ya existe otro usuario activo con el nombre '${updateUsuarioDto.nombre}'`);
        }

        usuario.nombre = updateUsuarioDto.nombre.trim();
      }

      // Validar que NO se envíen campos de solo lectura en actualización
      if ('estado' in updateUsuarioDto) {
        throw new BadRequestException('El campo estado no se puede modificar. Use el endpoint de eliminación lógica.');
      }

      if ('id' in updateUsuarioDto) {
        throw new BadRequestException('El campo id no se puede modificar. Es de solo lectura.');
      }
      
      const usuarioActualizado = await this.usuarioRepository.save(usuario);
      console.log(`Usuario con ID ${id} actualizado exitosamente`);
      
      return usuarioActualizado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException || 
          error instanceof ConflictException) {
        throw error;
      }
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al actualizar usuario');
    }
  }

  // DELETE eliminación lógica (cambiar estado de true a false)
  async remove(id: number, usuarioModificaId: number): Promise<{ message: string }> {
    // Validar ID del usuario a eliminar
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del usuario debe ser un número válido mayor a 0');
    }

    // Validar ID del usuario que está eliminando
    if (!usuarioModificaId || isNaN(usuarioModificaId) || usuarioModificaId <= 0) {
      throw new BadRequestException('El ID del usuario que está eliminando debe ser un número válido mayor a 0');
    }

    // Verificar que el usuario que está eliminando existe en la base de datos
    try {
      await this.findOne(usuarioModificaId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(`El usuario con ID ${usuarioModificaId} no existe o está inactivo`);
      }
      throw error;
    }

    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id, estado: true }
      });

      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado o inactivo`);
      }
      
      // Verificar si el usuario ya está inactivo
      if (!usuario.estado) {
        throw new BadRequestException(`El usuario con ID ${id} ya está inactivo`);
      }
      
      usuario.estado = false;
      await this.usuarioRepository.save(usuario);
      
      console.log(`Usuario con ID ${id} eliminado lógicamente`);
      return { message: `Usuario con ID ${id} eliminado lógicamente` };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al eliminar usuario');
    }
  }

  // Métodos que nos pueden servir: Reactivar usuario
  async reactivate(id: number): Promise<IUsuario> {
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del usuario debe ser un número válido mayor a 0');
    }

    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id }
      });

      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      if (usuario.estado) {
        throw new BadRequestException(`El usuario con ID ${id} ya está activo`);
      }

      usuario.estado = true;
      const usuarioReactivado = await this.usuarioRepository.save(usuario);
      
      console.log(`Usuario con ID ${id} reactivado exitosamente`);
      return usuarioReactivado;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Error al reactivar usuario con ID ${id}:`, error);
      throw new InternalServerErrorException('Error interno del servidor al reactivar usuario');
    }
  }

  // Métodos que nos pueden servir: Buscar usuarios por nombre (búsqueda parcial)
  async searchByName(nombre: string): Promise<IUsuario[]> {
    if (!nombre || nombre.trim().length === 0) {
      throw new BadRequestException('El término de búsqueda no puede estar vacío');
    }

    if (nombre.trim().length < 2) {
      throw new BadRequestException('El término de búsqueda debe tener al menos 2 caracteres');
    }

    try {
      const usuarios = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .where('usuario.nombre LIKE :nombre', { nombre: `%${nombre.trim()}%` })
        .andWhere('usuario.estado = :estado', { estado: true })
        .getMany();

      if (usuarios.length === 0) {
        console.log(`No se encontraron usuarios que coincidan con '${nombre}'`);
      }

      return usuarios;
    } catch (error) {
      console.error(`Error al buscar usuarios por nombre '${nombre}':`, error);
      throw new InternalServerErrorException('Error interno del servidor al buscar usuarios');
    }
  }
}
