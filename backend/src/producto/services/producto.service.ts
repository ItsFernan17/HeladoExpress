import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Producto } from '../entities/producto.entity';
import { IProductoService } from '../entities/interfaces/producto-service.interface';
import { ProductoRepository } from '../repositories/producto.repository';
import { CategoriaService } from '../../categoria/services/categoria.service';

@Injectable()
export class ProductoService implements IProductoService {
  constructor(
    private readonly productoRepository: ProductoRepository,
    private readonly categoriaService: CategoriaService,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    // Validar que la categoria existe y está activa
    const categoria = await this.categoriaService.findOne(createProductoDto.categoria_id);
    
    const producto = this.productoRepository.create({
      nombre: createProductoDto.nombre,
      precio_base: createProductoDto.precio_base,
      categoria_id: categoria,
    });
    return await this.productoRepository.save(producto);
  }

  async findAll(): Promise<Producto[]> {
    return await this.productoRepository.findActiveStates();
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findActiveById(id);

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.findOne(id);
    
    // Si se está cambiando la categoria, validar que existe y está activa
    if (updateProductoDto.categoria_id) {
      const categoria = await this.categoriaService.findOne(updateProductoDto.categoria_id);
      producto.categoria_id = categoria;
    }
    
    // Asignar otros campos si existen
    if (updateProductoDto.nombre) {
      producto.nombre = updateProductoDto.nombre;
    }
    if (updateProductoDto.precio_base) {
      producto.precio_base = updateProductoDto.precio_base;
    }
    if (updateProductoDto.esta_activo !== undefined) {
      producto.esta_activo = updateProductoDto.esta_activo;
    }
    
    return await this.productoRepository.save(producto);
  }

  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);
    
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    await this.productoRepository.softDeleteById(id);
  }

  async findByNombre(nombre: string): Promise<Producto | null> {
    return await this.productoRepository.findByNombre(nombre);
  }
}
