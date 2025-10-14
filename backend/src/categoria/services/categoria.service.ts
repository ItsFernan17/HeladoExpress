import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto';
import { Categoria } from '../entities/categoria.entity';
import { ICategoriaService } from '../entities/interfaces/categoria-service.interface';
import { CategoriaRepository } from '../repositories/categoria.repository';

@Injectable()
export class CategoriaService implements ICategoriaService {
  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const categoria = this.categoriaRepository.create(createCategoriaDto);
    return await this.categoriaRepository.save(categoria);
  }

  async findAll(): Promise<Categoria[]> {
    return await this.categoriaRepository.findActiveStates();
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findActiveById(id);

    if (!categoria) {
      throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
    }

    return categoria;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria> {
    const categoria = await this.findOne(id);
    
    Object.assign(categoria, updateCategoriaDto);
    return await this.categoriaRepository.save(categoria);
  }

  async remove(id: number): Promise<void> {
    const categoria = await this.findOne(id);
    
    if (!categoria) {
      throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
    }

    await this.categoriaRepository.softDeleteById(id);
  }

  async findByNombre(nombre: string): Promise<Categoria | null> {
    return await this.categoriaRepository.findByNombre(nombre);
  }
}
