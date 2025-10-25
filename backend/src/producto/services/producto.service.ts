import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Producto } from '../entities/producto.entity';
import { IProductoService } from '../entities/interfaces/producto-service.interface';
import { ProductoRepository } from '../repositories/producto.repository';
import { CategoriaService } from '../../categoria/services/categoria.service';

@Injectable()
export class ProductoService implements IProductoService {
  private readonly logger = new Logger(ProductoService.name);

  constructor(
    private readonly productoRepository: ProductoRepository,
    private readonly categoriaService: CategoriaService,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    try {
      // Validar que el nombre no esté vacío después del trim
      if (!createProductoDto.nombre?.trim()) {
        throw new BadRequestException('El nombre del producto no puede estar vacío');
      }

      // Validar que la categoria existe y está activa
      const categoria = await this.categoriaService.findOne(createProductoDto.categoria_id);
      
      const nombreTrimmed = createProductoDto.nombre.trim();

      // Buscar si existe un producto con el mismo nombre en la misma categoría (activo o inactivo)
      const existingProducto = await this.productoRepository.findOne({
        where: { 
          nombre: nombreTrimmed,
          categoria_id: createProductoDto.categoria_id 
        },
        relations: ['categoria_id']
      });
      
      if (existingProducto) {
        if (existingProducto.esta_activo) {
          // Si existe y está activo, lanzar error de conflicto
          throw new ConflictException(
            `Ya existe un producto con el nombre "${nombreTrimmed}" en esta categoría`
          );
        } else {
          // Si existe pero está inactivo, reactivarlo
          existingProducto.esta_activo = true;
          existingProducto.precio_base = createProductoDto.precio_base;
          existingProducto.moneda = createProductoDto.moneda || existingProducto.moneda || 'Q';
          
          const reactivatedProducto = await this.productoRepository.save(existingProducto);
          this.logger.log(`Producto reactivado exitosamente: ${reactivatedProducto.nombre} (ID: ${reactivatedProducto.id})`);
          
          return reactivatedProducto;
        }
      }
      
      const producto = this.productoRepository.create({
        nombre: nombreTrimmed,
        precio_base: createProductoDto.precio_base,
        moneda: createProductoDto.moneda || 'Q',
        categoria_id: categoria,
        esta_activo: createProductoDto.esta_activo ?? true
      });
      
      const savedProducto = await this.productoRepository.save(producto);
      this.logger.log(`Producto creado exitosamente: ${savedProducto.nombre} (ID: ${savedProducto.id})`);
      
      return savedProducto;
    } catch (error) {
      this.logger.error(`Error al crear producto: ${error.message}`, error.stack);

      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error interno al crear el producto');
    }
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
    try {
      // Validar que el ID sea un número positivo
      if (!id || id <= 0) {
        throw new BadRequestException('El ID del producto debe ser un número positivo');
      }

      // Verificar que el producto existe
      const producto = await this.findOne(id);
      
      // Si se actualiza el nombre, verificar que no exista otro producto con el mismo nombre en la misma categoría
      if (updateProductoDto.nombre) {
        const trimmedNombre = updateProductoDto.nombre.trim();
        
        if (!trimmedNombre) {
          throw new BadRequestException('El nombre del producto no puede estar vacío');
        }

        // Determinar la categoría a verificar (nueva o actual)
        const categoriaIdToCheck = updateProductoDto.categoria_id || producto.categoria_id.id;
        
        const existingProducto = await this.productoRepository.findByNombreAndCategoria(
          trimmedNombre, 
          categoriaIdToCheck
        );
        
        if (existingProducto && existingProducto.id !== id) {
          throw new ConflictException(
            `Ya existe un producto con el nombre "${trimmedNombre}" en esta categoría`
          );
        }

        producto.nombre = trimmedNombre;
      }
      
      // Si se está cambiando la categoria, validar que existe y está activa
      if (updateProductoDto.categoria_id) {
        const categoria = await this.categoriaService.findOne(updateProductoDto.categoria_id);
        producto.categoria_id = categoria;
      }
      
      // Asignar otros campos si existen
      if (updateProductoDto.precio_base !== undefined) {
        producto.precio_base = updateProductoDto.precio_base;
      }
      if (updateProductoDto.moneda) {
        producto.moneda = updateProductoDto.moneda;
      }
      if (updateProductoDto.esta_activo !== undefined) {
        producto.esta_activo = updateProductoDto.esta_activo;
      }
      
      const updatedProducto = await this.productoRepository.save(producto);
      this.logger.log(`Producto actualizado exitosamente: ${updatedProducto.nombre} (ID: ${updatedProducto.id})`);
      
      return updatedProducto;
    } catch (error) {
      this.logger.error(`Error al actualizar producto con ID ${id}: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Error interno al actualizar el producto');
    }
  }

  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);

    await this.productoRepository.softDeleteById(id);
  }

  async findByNombre(nombre: string): Promise<Producto | null> {
    return await this.productoRepository.findByNombre(nombre);
  }

  async findByCategoria(categoriaId: number): Promise<Producto[]> {
    try {
      // Validar que la categoria existe
      await this.categoriaService.findOne(categoriaId);

      const productos = await this.productoRepository.findByCategoria(categoriaId);
      this.logger.log(`Encontrados ${productos.length} productos para categoría ${categoriaId}`);

      return productos;
    } catch (error) {
      this.logger.error(`Error al buscar productos por categoría ${categoriaId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
