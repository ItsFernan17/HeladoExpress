import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ImageRepository } from '../repositories/image.repository';
import { CreateImageDto } from '../dto/create-image.dto';
import { UpdateImageDto } from '../dto/update-image.dto';
import { Image } from '../entities/image.entity';
import { MulterConfigService } from '../../upload/multer-config.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly multerConfigService: MulterConfigService
  ) {}

  async create(createImageDto: CreateImageDto): Promise<Image> {
    // Desactivar imágenes anteriores para esta entidad
    await this.imageRepository.deactivateByEntity(
      createImageDto.entity_type,
      createImageDto.entity_id
    );

    // Crear nueva imagen con esta_activo = true por defecto
    const imageData = {
      ...createImageDto,
      esta_activo: true
    };

    return await this.imageRepository.create(imageData);
  }

  async findAll(): Promise<Image[]> {
    return await this.imageRepository.findAll();
  }

  async findById(id: number): Promise<Image> {
    const image = await this.imageRepository.findById(id);
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return image;
  }

  async findByEntity(entity_type: 'categoria' | 'producto', entity_id: number): Promise<Image | null> {
    return await this.imageRepository.findByEntity(entity_type, entity_id);
  }

  async findByEntityType(entity_type: 'categoria' | 'producto'): Promise<Image[]> {
    return await this.imageRepository.findByEntityType(entity_type);
  }

  async update(id: number, updateImageDto: UpdateImageDto): Promise<Image> {
    const image = await this.findById(id);
    const updatedImage = await this.imageRepository.update(id, updateImageDto);
    
    if (!updatedImage) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    
    return updatedImage;
  }

  async delete(id: number): Promise<boolean> {
    const image = await this.findById(id);
    
    // Eliminar archivo físico
    try {
      await fs.unlink(image.path);
    } catch (error) {
      console.warn(`Could not delete file at ${image.path}:`, error);
    }

    return await this.imageRepository.delete(id);
  }

  async deleteByEntity(entity_type: 'categoria' | 'producto', entity_id: number): Promise<boolean> {
    const image = await this.imageRepository.findByEntity(entity_type, entity_id);
    
    if (!image) {
      return true; // No hay imagen activa que desactivar
    }

    // Desactivar en lugar de eliminar físicamente
    await this.imageRepository.deactivateByEntity(entity_type, entity_id);
    return true;
  }

  async replaceEntityImage(
    entity_type: 'categoria' | 'producto',
    entity_id: number,
    file: Express.Multer.File
  ): Promise<Image> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      // Desactivar imagen anterior si existe
      await this.imageRepository.deactivateByEntity(entity_type, entity_id);

      // Log para debugging
      console.log(`Processing file for ${entity_type} ${entity_id}:`, {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer ? 'present' : 'missing'
      });

      // Verificar que el buffer existe (ahora usamos memoryStorage)
      if (!file.buffer) {
        throw new Error('File buffer not found - memoryStorage not working');
      }

      // Procesar y optimizar la imagen desde buffer
      const optimizedPath = await this.multerConfigService.processImageFromBuffer(
        file.buffer, 
        file.originalname
      );
      const optimizedFilename = path.basename(optimizedPath);

      // Crear datos de la nueva imagen con UUID único
      const imageUuid = uuidv4();
      const createImageDto: CreateImageDto = {
        uuid: imageUuid,
        filename: optimizedFilename,
        path: optimizedPath,
        entity_type,
        entity_id,
        mime_type: 'image/webp', // Siempre será webp después del procesamiento
        size: (await fs.stat(optimizedPath)).size,
        esta_activo: true,
      };

      const savedImage = await this.create(createImageDto);
      
      // Log para debugging
      console.log(`Image saved for ${entity_type} ${entity_id}:`, {
        uuid: savedImage.uuid,
        filename: savedImage.filename,
        url: this.getImageUrl(savedImage),
        esta_activo: savedImage.esta_activo
      });

      return savedImage;
    } catch (error) {
      // No hay archivos temporales que limpiar con memoryStorage
      console.error('Error in replaceEntityImage:', error);
      throw new BadRequestException('Failed to process image: ' + error.message);
    }
  }

  getImageUrl(image: Image): string {
    return `/api/v1/uploads/images/${image.filename}`;
  }
}