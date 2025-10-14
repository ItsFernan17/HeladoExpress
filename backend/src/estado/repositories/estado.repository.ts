import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estado } from '../entities/estado.entity';
import { IEstadoRepository } from '../entities/interfaces/estado-repository.interface';

@Injectable()
export class EstadoRepository implements IEstadoRepository {
  constructor(
    @InjectRepository(Estado)
    private readonly repository: Repository<Estado>,
  ) {}

  create(estado: Partial<Estado>): Estado {
    return this.repository.create(estado);
  }

  async save(estado: Estado): Promise<Estado> {
    return await this.repository.save(estado);
  }

  async find(options?: any): Promise<Estado[]> {
    return await this.repository.find(options);
  }

  async findOne(options: any): Promise<Estado | null> {
    return await this.repository.findOne(options);
  }

  async findActiveStates(): Promise<Estado[]> {
    return await this.repository.find({
      where: { esta_activo: true },
    });
  }

  async findActiveById(id: number): Promise<Estado | null> {
    return await this.repository.findOne({
      where: { id, esta_activo: true },
    });
  }

  async softDeleteById(id: number): Promise<void> {
    await this.repository.update(id, { esta_activo: false });
  }

  async findByNombre(nombre: string): Promise<Estado | null> {
    return await this.repository.findOne({
      where: { nombre, esta_activo: true },
    });
  }
}
