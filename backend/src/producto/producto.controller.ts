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
import { ProductoService } from './services/producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ImageService } from '../image/services/image.service';

@Controller('producto')
export class ProductoController {
  private readonly logger = new Logger(ProductoController.name);

  constructor(
    private readonly productoService: ProductoService,
    private readonly imageService: ImageService,
  ) {}

  @Post()
  async create(@Body() createProductoDto: CreateProductoDto) {
    return await this.productoService.create(createProductoDto);
  }

  @Post(':id/imagen')
  @UseInterceptors(FileInterceptor('imagen'))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    try {
      // Verificar que el producto existe
      await this.productoService.findOne(id);

      // Subir imagen usando el nuevo sistema
      const image = await this.imageService.replaceEntityImage('producto', id, file);
      
      // Obtener URL para la imagen
      const imageUrl = this.imageService.getImageUrl(image);
      
      this.logger.log(`Image URL generated: ${imageUrl}`);
      
      // Ya no necesitamos actualizar imagen_url en el producto
      const producto = await this.productoService.findOne(id);

      this.logger.log(`Uploaded image for producto ${id}: ${image.filename}, URL: ${imageUrl}, UUID: ${image.uuid}`);

      return {
        ...producto,
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
      this.logger.error(`Error processing image for producto ${id}: ${error.message}`);
      throw new BadRequestException(`Error procesando la imagen: ${error.message}`);
    }
  }

  @Get()
  async findAll() {
    const productos = await this.productoService.findAll();
    
    // Agregar información de imagen a cada producto
    const productosWithImages = await Promise.all(
      productos.map(async (producto) => {
        const image = await this.imageService.findByEntity('producto', producto.id);
        
        const productoWithImage = {
          ...producto,
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
          this.logger.log(`Producto ${producto.id} has image: ${image.filename}, URL: ${this.imageService.getImageUrl(image)}, UUID: ${image.uuid}`);
        }
        
        return productoWithImage;
      })
    );

    return productosWithImages;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const producto = await this.productoService.findOne(id);
    const image = await this.imageService.findByEntity('producto', id);
    
    return {
      ...producto,
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
    const image = await this.imageService.findByEntity('producto', id);
    if (!image) {
      throw new BadRequestException('No image found for this producto');
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
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return await this.productoService.update(id, updateProductoDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      // Eliminar imagen asociada antes de eliminar el producto
      await this.imageService.deleteByEntity('producto', id);
      this.logger.log(`Deleted image for producto ${id}`);

      return await this.productoService.remove(id);
    } catch (error) {
      this.logger.error(`Error removing producto ${id}: ${error.message}`);
      // Continuar con la eliminación aunque falle la limpieza de imagen
      return await this.productoService.remove(id);
    }
  }

  @Delete(':id/imagen')
  async removeImage(@Param('id', ParseIntPipe) id: number) {
    try {
      const deleted = await this.imageService.deleteByEntity('producto', id);
      if (!deleted) {
        throw new BadRequestException('No image found for this producto');
      }

      return { message: 'Image deleted successfully' };
    } catch (error) {
      this.logger.error(`Error removing image for producto ${id}: ${error.message}`);
      throw new BadRequestException(`Error eliminando la imagen: ${error.message}`);
    }
  }
}
