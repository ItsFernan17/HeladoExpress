import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriaService } from './services/categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { ImageService } from '../image/services/image.service';
import { validateImageFile } from '../utils/file-validation.dto';

@Controller('categoria')
export class CategoriaController {
  private readonly logger = new Logger(CategoriaController.name);

  constructor(
    private readonly categoriaService: CategoriaService,
    private readonly imageService: ImageService,
  ) {}

  @Post()
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return await this.categoriaService.create(createCategoriaDto);
  }

  @Post(':id/imagen')
  @UseInterceptors(FileInterceptor('imagen'))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha seleccionado ningún archivo');
    }

    try {
      // Validar el archivo usando las nuevas validaciones
      validateImageFile(file);

      // Verificar que la categoría existe
      await this.categoriaService.findOne(id);

      // Subir imagen usando el nuevo sistema
      const image = await this.imageService.replaceEntityImage('categoria', id, file);
      
      // Obtener URL para la imagen
      const imageUrl = this.imageService.getImageUrl(image);
      
      this.logger.log(`Image URL generated: ${imageUrl}`);
      
      // Ya no necesitamos actualizar imagen_url en la categoría
      const categoria = await this.categoriaService.findOne(id);

      this.logger.log(`Uploaded image for categoria ${id}: ${image.filename}, URL: ${imageUrl}, UUID: ${image.uuid}`);

      return {
        ...categoria,
        image: {
          id: image.id,
          uuid: image.uuid,
          filename: image.filename,
          url: imageUrl,
          size: image.size,
          esta_activo: image.esta_activo,
          created_at: image.created_at
        }
      };
    } catch (error) {
      this.logger.error(`Error processing image for categoria ${id}: ${error.message}`);
      throw new BadRequestException(`Error procesando la imagen: ${error.message}`);
    }
  }

  @Get()
  async findAll() {
    const categorias = await this.categoriaService.findAll();
    
    // Agregar información de imagen a cada categoría
    const categoriasWithImages = await Promise.all(
      categorias.map(async (categoria) => {
        const image = await this.imageService.findByEntity('categoria', categoria.id);
        
        const categoriaWithImage = {
          ...categoria,
          image: image ? {
            id: image.id,
            uuid: image.uuid,
            filename: image.filename,
            url: this.imageService.getImageUrl(image),
            size: image.size,
            esta_activo: image.esta_activo,
            created_at: image.created_at
          } : null
        };
        
        // Log para debugging
        if (image) {
          this.logger.log(`Categoria ${categoria.id} has image: ${image.filename}, URL: ${this.imageService.getImageUrl(image)}, UUID: ${image.uuid}`);
        }
        
        return categoriaWithImage;
      })
    );

    return categoriasWithImages;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const categoria = await this.categoriaService.findOne(id);
    const image = await this.imageService.findByEntity('categoria', id);
    
    return {
      ...categoria,
      image: image ? {
        id: image.id,
        uuid: image.uuid,
        filename: image.filename,
        url: this.imageService.getImageUrl(image),
        size: image.size,
        esta_activo: image.esta_activo,
        created_at: image.created_at
      } : null
    };
  }

  @Get(':id/imagen')
  async getImage(@Param('id', ParseIntPipe) id: number) {
    const image = await this.imageService.findByEntity('categoria', id);
    if (!image) {
      throw new BadRequestException('No image found for this categoria');
    }
    
    return {
      id: image.id,
      uuid: image.uuid,
      filename: image.filename,
      url: this.imageService.getImageUrl(image),
      size: image.size,
      esta_activo: image.esta_activo,
      created_at: image.created_at
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return await this.categoriaService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      // Eliminar imagen asociada antes de eliminar la categoría
      await this.imageService.deleteByEntity('categoria', id);
      this.logger.log(`Deleted image for categoria ${id}`);

      return await this.categoriaService.remove(id);
    } catch (error) {
      this.logger.error(`Error removing categoria ${id}: ${error.message}`);
      // Continuar con la eliminación aunque falle la limpieza de imagen
      return await this.categoriaService.remove(id);
    }
  }

  @Delete(':id/imagen')
  async removeImage(@Param('id', ParseIntPipe) id: number) {
    try {
      const deleted = await this.imageService.deleteByEntity('categoria', id);
      if (!deleted) {
        throw new BadRequestException('No image found for this categoria');
      }

      return { message: 'Image deleted successfully' };
    } catch (error) {
      this.logger.error(`Error removing image for categoria ${id}: ${error.message}`);
      throw new BadRequestException(`Error eliminando la imagen: ${error.message}`);
    }
  }
}
