import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEstadoDto } from '../dto/create-estado.dto';
import { UpdateEstadoDto } from '../dto/update-estado.dto';
import { Estado } from '../entities/estado.entity';
import { IEstadoService } from '../entities/interfaces/estado-service.interface';
import { EstadoRepository } from '../repositories/estado.repository';

@Injectable()
export class EstadoService implements IEstadoService {
  constructor(private readonly estadoRepository: EstadoRepository) {}

  async create(createEstadoDto: CreateEstadoDto): Promise<Estado> {
    const estado = this.estadoRepository.create(createEstadoDto);
    return await this.estadoRepository.save(estado);
  }

  async findAll(): Promise<Estado[]> {
    return await this.estadoRepository.findActiveStates();
  }

  async findOne(id: number): Promise<Estado> {
    const estado = await this.estadoRepository.findActiveById(id);

    if (!estado) {
      throw new NotFoundException(`Estado con ID ${id} no encontrado`);
    }

    return estado;
  }

  async update(id: number, updateEstadoDto: UpdateEstadoDto): Promise<Estado> {
    const estado = await this.findOne(id);
    
    Object.assign(estado, updateEstadoDto);
    return await this.estadoRepository.save(estado);
  }

  async remove(id: number): Promise<void> {
    const estado = await this.findOne(id);
    
    if (!estado) {
      throw new NotFoundException(`Estado con ID ${id} no encontrado`);
    }

    await this.estadoRepository.softDeleteById(id);
  }

  async findByNombre(nombre: string): Promise<Estado | null> {
    return await this.estadoRepository.findByNombre(nombre);
  }
}
