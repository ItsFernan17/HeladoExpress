import { Injectable } from '@nestjs/common';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import sharp from 'sharp';
import * as path from 'path';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    // Asegurar que existe la carpeta de destino
    const uploadDir = 'uploads/images';
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true });
    }

    return {
      storage: memoryStorage(), // Usar memoria en lugar de disco
      fileFilter: (req, file, cb) => {
        // Solo permitir imágenes
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
      },
    };
  }

  /**
   * Procesa y optimiza la imagen desde buffer en memoria
   * Ajusta al tamaño TFT (320x240) manteniendo la imagen completa visible
   * Guarda directamente el archivo final optimizado
   */
  async processImageFromBuffer(buffer: Buffer, originalname: string): Promise<string> {
    try {
      // Asegurar que existe la carpeta de destino
      const uploadDir = 'uploads/images';
      if (!fsSync.existsSync(uploadDir)) {
        fsSync.mkdirSync(uploadDir, { recursive: true });
      }

      // Listar archivos existentes ANTES del procesamiento
      const filesBefore = fsSync.readdirSync(uploadDir);
      console.log(`Files BEFORE processing:`, filesBefore);

      // Generar nombre único para el archivo final
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `imagen-${uniqueSuffix}.webp`;
      const outputPath = path.join(uploadDir, filename);

      console.log(`Processing image ${originalname} to SINGLE file: ${outputPath}`);
      
      // Procesar directamente desde buffer a archivo final - SOLO 1 ARCHIVO
      await sharp(buffer)
        .resize(320, 240, { 
          fit: 'contain',           // Mantiene toda la imagen visible
          background: '#FFFFFF'     // Fondo blanco para áreas vacías
        })
        .webp({ 
          quality: 90,
          effort: 4
        })
        .toFile(outputPath);

      // Listar archivos existentes DESPUÉS del procesamiento
      const filesAfter = fsSync.readdirSync(uploadDir);
      console.log(`Files AFTER processing:`, filesAfter);
      console.log(`Successfully created ONLY ONE file: ${outputPath}`);
      
      return outputPath;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  // Método legacy para compatibilidad (ya no se usa)
  async processImage(filePath: string): Promise<string> {
    throw new Error('processImage deprecated - use processImageFromBuffer instead');
  }
}