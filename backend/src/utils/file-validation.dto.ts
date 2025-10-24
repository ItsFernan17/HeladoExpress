import { IsOptional, IsString, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class FileUploadDto {
  @IsOptional()
  @IsString({ message: 'El nombre del archivo debe ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  filename?: string;

  @IsOptional()
  @IsString({ message: 'El tipo MIME del archivo debe ser una cadena de texto' })
  @ValidateIf((o, value) => value !== undefined)
  @Transform(({ value }) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif'
    ];
    
    if (value && !allowedTypes.includes(value.toLowerCase())) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes: JPG, JPEG, PNG, WEBP, GIF');
    }
    
    return value;
  })
  mimetype?: string;

  @IsOptional()
  size?: number;
}

// Función de validación personalizada para archivos
export function validateImageFile(file: Express.Multer.File): void {
  if (!file) {
    throw new Error('No se ha seleccionado ningún archivo');
  }

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype.toLowerCase())) {
    throw new Error('Tipo de archivo no válido. Solo se permiten imágenes: JPG, JPEG, PNG, WEBP, GIF');
  }

  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB en bytes
  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. El tamaño máximo permitido es 5MB');
  }

  // Validar dimensiones mínimas si es necesario
  // Esto requeriría usar una librería como sharp para leer las dimensiones
  
  // Validar nombre de archivo
  if (file.originalname) {
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(file.originalname)) {
      throw new Error('El nombre del archivo contiene caracteres no válidos');
    }
  }
}

// Validaciones adicionales para nombres de archivos
export function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/[<>:"/\\|?*]/g, '_') // Reemplazar caracteres inválidos
    .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
    .toLowerCase();
}