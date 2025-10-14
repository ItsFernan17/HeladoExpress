import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sabor } from '../entities/sabor.entity';
import { ISaborRepository } from '../entities/interfaces/sabor-repository.interface';

@Injectable()
export class SaborRepository implements ISaborRepository {
  constructor(
    @InjectRepository(Sabor)
    private readonly repository: Repository<Sabor>,
  ) {}

  create(sabor: Partial<Sabor>): Sabor {
    return this.repository.create(sabor);
  }

  async save(sabor: Sabor): Promise<Sabor> {
    return await this.repository.save(sabor);
  }

  async find(options?: any): Promise<Sabor[]> {
    return await this.repository.find(options);
  }

  async findOne(options: any): Promise<Sabor | null> {
    return await this.repository.findOne(options);
  }

  async findActiveStates(): Promise<Sabor[]> {
    return await this.repository.find({
      where: { esta_activo: true },
    });
  }

  async findActiveById(id: number): Promise<Sabor | null> {
    return await this.repository.findOne({
      where: { id, esta_activo: true },
    });
  }

  async softDeleteById(id: number): Promise<void> {
    await this.repository.update(id, { esta_activo: false });
  }

  async findByNombre(nombre: string): Promise<Sabor | null> {
    return await this.repository.findOne({
      where: { nombre, esta_activo: true },
    });
  }
}
