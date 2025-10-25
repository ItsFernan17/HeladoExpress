import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { CreateSaborDto } from '../dto/create-sabor.dto';
import { UpdateSaborDto } from '../dto/update-sabor.dto';
import { Sabor } from '../entities/sabor.entity';
import { ISaborService } from '../entities/interfaces/sabor-service.interface';
import { SaborRepository } from '../repositories/sabor.repository';

@Injectable()
export class SaborService implements ISaborService {
  private readonly logger = new Logger(SaborService.name);

  constructor(private readonly saborRepository: SaborRepository) {}

  async create(createSaborDto: CreateSaborDto): Promise<Sabor> {
    try {
      // Validar que el nombre no esté vacío después del trim
      if (!createSaborDto.nombre?.trim()) {
        throw new BadRequestException('El nombre del sabor no puede estar vacío');
      }

      const nombreTrimmed = createSaborDto.nombre.trim();

      // Buscar si existe un sabor con el mismo nombre (activo o inactivo)
      const existingSabor = await this.saborRepository.findOne({
        where: { nombre: nombreTrimmed }
      });

      if (existingSabor) {
        if (existingSabor.esta_activo) {
          // Si existe y está activo, lanzar error de conflicto
          throw new ConflictException(`Ya existe un sabor con el nombre "${nombreTrimmed}"`);
        } else {
          // Si existe pero está inactivo, reactivarlo
          existingSabor.esta_activo = true;
          
          const reactivatedSabor = await this.saborRepository.save(existingSabor);
          this.logger.log(`Sabor reactivado exitosamente: ${reactivatedSabor.nombre} (ID: ${reactivatedSabor.id})`);
          
          return reactivatedSabor;
        }
      }

      // Si no existe, crear nuevo sabor
      const sabor = this.saborRepository.create({
        ...createSaborDto,
        nombre: nombreTrimmed,
        esta_activo: createSaborDto.esta_activo ?? true
      });

      const savedSabor = await this.saborRepository.save(sabor);
      this.logger.log(`Sabor creado exitosamente: ${savedSabor.nombre} (ID: ${savedSabor.id})`);
      
      return savedSabor;
    } catch (error) {
      this.logger.error(`Error al crear sabor: ${error.message}`, error.stack);

      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error interno al crear el sabor');
    }
  }

  async findAll(): Promise<Sabor[]> {
    return await this.saborRepository.findActiveStates();
  }

  async findOne(id: number): Promise<Sabor> {
    const sabor = await this.saborRepository.findActiveById(id);

    if (!sabor) {
      throw new NotFoundException(`Sabor con ID ${id} no encontrado`);
    }

    return sabor;
  }

  async update(id: number, updateSaborDto: UpdateSaborDto): Promise<Sabor> {
    try {
      // Validar que el ID sea un número positivo
      if (!id || id <= 0) {
        throw new BadRequestException('El ID del sabor debe ser un número positivo');
      }

      // Verificar que el sabor existe
      const sabor = await this.findOne(id);
      
      // Si se actualiza el nombre, verificar que no exista otro sabor con el mismo nombre
      if (updateSaborDto.nombre) {
        const trimmedNombre = updateSaborDto.nombre.trim();
        
        if (!trimmedNombre) {
          throw new BadRequestException('El nombre del sabor no puede estar vacío');
        }

        const existingSabor = await this.saborRepository.findByNombre(trimmedNombre);
        if (existingSabor && existingSabor.id !== id) {
          throw new ConflictException(`Ya existe un sabor con el nombre "${trimmedNombre}"`);
        }

        updateSaborDto.nombre = trimmedNombre;
      }

      Object.assign(sabor, updateSaborDto);
      const updatedSabor = await this.saborRepository.save(sabor);
      
      this.logger.log(`Sabor actualizado exitosamente: ${updatedSabor.nombre} (ID: ${updatedSabor.id})`);
      return updatedSabor;
    } catch (error) {
      this.logger.error(`Error al actualizar sabor con ID ${id}: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Error interno al actualizar el sabor');
    }
  }

  async remove(id: number): Promise<void> {
    const sabor = await this.findOne(id);

    await this.saborRepository.softDeleteById(id);
  }

  async findByNombre(nombre: string): Promise<Sabor | null> {
    return await this.saborRepository.findByNombre(nombre);
  }
}
