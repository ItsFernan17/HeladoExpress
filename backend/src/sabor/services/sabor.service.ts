import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaborDto } from '../dto/create-sabor.dto';
import { UpdateSaborDto } from '../dto/update-sabor.dto';
import { Sabor } from '../entities/sabor.entity';
import { ISaborService } from '../entities/interfaces/sabor-service.interface';
import { SaborRepository } from '../repositories/sabor.repository';

@Injectable()
export class SaborService implements ISaborService {
  constructor(private readonly saborRepository: SaborRepository) {}

  async create(createSaborDto: CreateSaborDto): Promise<Sabor> {
    const sabor = this.saborRepository.create(createSaborDto);
    return await this.saborRepository.save(sabor);
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
    const sabor = await this.findOne(id);
    
    Object.assign(sabor, updateSaborDto);
    return await this.saborRepository.save(sabor);
  }

  async remove(id: number): Promise<void> {
    const sabor = await this.findOne(id);
    
    if (!sabor) {
      throw new NotFoundException(`Sabor con ID ${id} no encontrado`);
    }

    await this.saborRepository.softDeleteById(id);
  }

  async findByNombre(nombre: string): Promise<Sabor | null> {
    return await this.saborRepository.findByNombre(nombre);
  }
}
