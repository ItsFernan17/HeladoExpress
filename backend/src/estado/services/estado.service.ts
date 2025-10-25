import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateEstadoDto } from '../dto/create-estado.dto';
import { UpdateEstadoDto } from '../dto/update-estado.dto';
import { Estado } from '../entities/estado.entity';
import { IEstadoService } from '../entities/interfaces/estado-service.interface';
import { EstadoRepository } from '../repositories/estado.repository';

@Injectable()
export class EstadoService implements IEstadoService {
  private readonly logger = new Logger(EstadoService.name);

  constructor(private readonly estadoRepository: EstadoRepository) {}

  async create(createEstadoDto: CreateEstadoDto): Promise<Estado> {
    const estado = this.estadoRepository.create(createEstadoDto);
    return await this.estadoRepository.save(estado);
  }

  async findAll(): Promise<Estado[]> {
    return await this.estadoRepository.findActiveStates();
  }

  async findOne(id: number): Promise<Estado> {
    try {
      // Validar que el ID sea un número positivo
      if (!id || id <= 0) {
        throw new NotFoundException('El ID del estado debe ser un número positivo');
      }

      const estado = await this.estadoRepository.findActiveById(id);

      if (!estado) {
        throw new NotFoundException(`Estado con ID ${id} no encontrado`);
      }

      return estado;
    } catch (error) {
      this.logger.error(`Error al buscar estado con ID ${id}: ${error.message}`, error.stack);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw error;
    }
  }

  async update(id: number, updateEstadoDto: UpdateEstadoDto): Promise<Estado> {
    try {
      // Validar que el ID sea un número positivo
      if (!id || id <= 0) {
        throw new NotFoundException('El ID del estado debe ser un número positivo');
      }

      // Verificar que el estado existe
      const estado = await this.findOne(id);

      Object.assign(estado, updateEstadoDto);
      const updatedEstado = await this.estadoRepository.save(estado);

      this.logger.log(`Estado actualizado exitosamente: ${updatedEstado.nombre} (ID: ${updatedEstado.id})`);

      return updatedEstado;
    } catch (error) {
      this.logger.error(`Error al actualizar estado con ID ${id}: ${error.message}`, error.stack);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      // Validar que el ID sea un número positivo
      if (!id || id <= 0) {
        throw new NotFoundException('El ID del estado debe ser un número positivo');
      }

      const estado = await this.findOne(id);

      await this.estadoRepository.softDeleteById(id);

      this.logger.log(`Estado eliminado exitosamente: ${estado.nombre} (ID: ${estado.id})`);
    } catch (error) {
      this.logger.error(`Error al eliminar estado con ID ${id}: ${error.message}`, error.stack);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw error;
    }
  }

  async findByNombre(nombre: string): Promise<Estado | null> {
    return await this.estadoRepository.findByNombre(nombre);
  }
}
