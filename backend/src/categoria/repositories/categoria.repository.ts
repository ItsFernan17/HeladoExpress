import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../entities/categoria.entity';
import { ICategoriaRepository } from '../entities/interfaces/categoria-repository.interface';

@Injectable()
export class CategoriaRepository implements ICategoriaRepository {
  constructor(
    @InjectRepository(Categoria)
    private readonly repository: Repository<Categoria>,
  ) {}

  create(categoria: Partial<Categoria>): Categoria {
    return this.repository.create(categoria);
  }

  async save(categoria: Categoria): Promise<Categoria> {
    return await this.repository.save(categoria);
  }

  async find(options?: any): Promise<Categoria[]> {
    return await this.repository.find(options);
  }

  async findOne(options: any): Promise<Categoria | null> {
    return await this.repository.findOne(options);
  }

  async findActiveStates(): Promise<Categoria[]> {
    return await this.repository.find({
      where: { esta_activo: true },
    });
  }

  async findActiveById(id: number): Promise<Categoria | null> {
    return await this.repository.findOne({
      where: { id, esta_activo: true },
    });
  }

  async softDeleteById(id: number): Promise<void> {
    await this.repository.update(id, { esta_activo: false });
  }

  async findByNombre(nombre: string): Promise<Categoria | null> {
    return await this.repository.findOne({
      where: { nombre, esta_activo: true },
    });
  }

  async hasActiveProducts(categoriaId: number): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder('categoria')
      .leftJoin('categoria.productos', 'producto')
      .where('categoria.id = :categoriaId', { categoriaId })
      .andWhere('producto.esta_activo = :activo', { activo: true })
      .getCount();
    
    return result > 0;
  }
}
