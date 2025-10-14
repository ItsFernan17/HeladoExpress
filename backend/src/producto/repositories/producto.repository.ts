import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../entities/producto.entity';
import { IProductoRepository } from '../entities/interfaces/producto-repository.interface';

@Injectable()
export class ProductoRepository implements IProductoRepository {
  constructor(
    @InjectRepository(Producto)
    private readonly repository: Repository<Producto>,
  ) {}

  create(producto: Partial<Producto>): Producto {
    return this.repository.create(producto);
  }

  async save(producto: Producto): Promise<Producto> {
    return await this.repository.save(producto);
  }

  async find(options?: any): Promise<Producto[]> {
    return await this.repository.find(options);
  }

  async findOne(options: any): Promise<Producto | null> {
    return await this.repository.findOne(options);
  }

  async findActiveStates(): Promise<Producto[]> {
    return await this.repository.find({
      where: { esta_activo: true },
      relations: ['categoria_id'],
    });
  }

  async findActiveById(id: number): Promise<Producto | null> {
    return await this.repository.findOne({
      where: { id, esta_activo: true },
      relations: ['categoria_id'],
    });
  }

  async softDeleteById(id: number): Promise<void> {
    await this.repository.update(id, { esta_activo: false });
  }

  async findByNombre(nombre: string): Promise<Producto | null> {
    return await this.repository.findOne({
      where: { nombre, esta_activo: true },
      relations: ['categoria_id'],
    });
  }
}
