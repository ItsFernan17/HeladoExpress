import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto';
import { Categoria } from '../entities/categoria.entity';
import { ICategoriaService } from '../entities/interfaces/categoria-service.interface';
import { CategoriaRepository } from '../repositories/categoria.repository';

@Injectable()
export class CategoriaService implements ICategoriaService {
  private readonly logger = new Logger(CategoriaService.name);

  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    try {
      // Validar que el nombre no esté vacío después del trim
      if (!createCategoriaDto.nombre?.trim()) {
        throw new BadRequestException('El nombre de la categoría no puede estar vacío');
      }

      const nombreTrimmed = createCategoriaDto.nombre.trim();

      // Buscar si existe una categoría con el mismo nombre (activa o inactiva)
      const existingCategoria = await this.categoriaRepository.findOne({
        where: { nombre: nombreTrimmed }
      });

      if (existingCategoria) {
        if (existingCategoria.esta_activo) {
          // Si existe y está activa, lanzar error de conflicto
          throw new ConflictException(`Ya existe una categoría con el nombre "${nombreTrimmed}"`);
        } else {
          // Si existe pero está inactiva, reactivarla
          existingCategoria.esta_activo = true;
          
          const reactivatedCategoria = await this.categoriaRepository.save(existingCategoria);
          this.logger.log(`Categoría reactivada exitosamente: ${reactivatedCategoria.nombre} (ID: ${reactivatedCategoria.id})`);
          
          return reactivatedCategoria;
        }
      }

      // Si no existe, crear nueva categoría
      const categoria = this.categoriaRepository.create({
        ...createCategoriaDto,
        nombre: nombreTrimmed,
        esta_activo: createCategoriaDto.esta_activo ?? true
      });

      const savedCategoria = await this.categoriaRepository.save(categoria);
      this.logger.log(`Categoría creada exitosamente: ${savedCategoria.nombre} (ID: ${savedCategoria.id})`);
      
      return savedCategoria;
    } catch (error) {
      this.logger.error(`Error al crear categoría: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Error interno al crear la categoría');
    }
  }

  async findAll(): Promise<Categoria[]> {
    try {
      const categorias = await this.categoriaRepository.findActiveStates();
      this.logger.log(`Se encontraron ${categorias.length} categorías activas`);
      return categorias;
    } catch (error) {
      this.logger.error(`Error al obtener categorías: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error interno al obtener las categorías');
    }
  }

  async findOne(id: number): Promise<Categoria> {
    try {
      // Validar que el ID sea un número positivo
      if (!id || id <= 0) {
        throw new BadRequestException('El ID de la categoría debe ser un número positivo');
      }

      const categoria = await this.categoriaRepository.findActiveById(id);

      if (!categoria) {
        throw new NotFoundException(`No se encontró la categoría con ID ${id} o está inactiva`);
      }

      this.logger.log(`Categoría encontrada: ${categoria.nombre} (ID: ${categoria.id})`);
      return categoria;
    } catch (error) {
      this.logger.error(`Error al buscar categoría con ID ${id}: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Error interno al buscar la categoría');
    }
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria> {
    try {
      // Validar que el ID sea un número positivo
      if (!id || id <= 0) {
        throw new BadRequestException('El ID de la categoría debe ser un número positivo');
      }

      // Verificar que la categoría existe
      const categoria = await this.findOne(id);
      
      // Si se actualiza el nombre, verificar que no exista otra categoría con el mismo nombre
      if (updateCategoriaDto.nombre) {
        const trimmedNombre = updateCategoriaDto.nombre.trim();
        
        if (!trimmedNombre) {
          throw new BadRequestException('El nombre de la categoría no puede estar vacío');
        }

        const existingCategoria = await this.categoriaRepository.findByNombre(trimmedNombre);
        if (existingCategoria && existingCategoria.id !== id) {
          throw new ConflictException(`Ya existe una categoría con el nombre "${trimmedNombre}"`);
        }

        updateCategoriaDto.nombre = trimmedNombre;
      }

      Object.assign(categoria, updateCategoriaDto);
      const updatedCategoria = await this.categoriaRepository.save(categoria);
      
      this.logger.log(`Categoría actualizada exitosamente: ${updatedCategoria.nombre} (ID: ${updatedCategoria.id})`);
      return updatedCategoria;
    } catch (error) {
      this.logger.error(`Error al actualizar categoría con ID ${id}: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Error interno al actualizar la categoría');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      // Validar que el ID sea un número positivo
      if (!id || id <= 0) {
        throw new BadRequestException('El ID de la categoría debe ser un número positivo');
      }

      const categoria = await this.findOne(id);
      
      // Verificar si la categoría tiene productos asociados
      const hasProducts = await this.categoriaRepository.hasActiveProducts(id);
      if (hasProducts) {
        throw new BadRequestException('No se puede eliminar la categoría porque tiene productos asociados. Primero elimine los productos de esta categoría.');
      }

      await this.categoriaRepository.softDeleteById(id);
      this.logger.log(`Categoría eliminada (lógicamente) exitosamente: ${categoria.nombre} (ID: ${categoria.id})`);
    } catch (error) {
      this.logger.error(`Error al eliminar categoría con ID ${id}: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Error interno al eliminar la categoría');
    }
  }

  async findByNombre(nombre: string): Promise<Categoria | null> {
    try {
      if (!nombre?.trim()) {
        throw new BadRequestException('El nombre de búsqueda no puede estar vacío');
      }

      return await this.categoriaRepository.findByNombre(nombre.trim());
    } catch (error) {
      this.logger.error(`Error al buscar categoría por nombre "${nombre}": ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Error interno al buscar la categoría por nombre');
    }
  }
}
