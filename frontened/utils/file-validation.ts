// Validaciones del lado del cliente para archivos
export interface FileValidationOptions {
  maxSize?: number; // En bytes
  allowedTypes?: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  file?: File;
}

// Configuración por defecto para imágenes
const DEFAULT_IMAGE_OPTIONS: FileValidationOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  minWidth: 100,
  minHeight: 100,
  maxWidth: 4000,
  maxHeight: 4000,
};

export function validateImageFile(
  file: File, 
  options: FileValidationOptions = DEFAULT_IMAGE_OPTIONS
): Promise<FileValidationResult> {
  return new Promise((resolve) => {
    // Validar que existe el archivo
    if (!file) {
      resolve({
        isValid: false,
        error: 'No se ha seleccionado ningún archivo'
      });
      return;
    }

    // Validar tamaño
    if (options.maxSize && file.size > options.maxSize) {
      const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(1);
      resolve({
        isValid: false,
        error: `El archivo es demasiado grande. Tamaño máximo permitido: ${maxSizeMB}MB`
      });
      return;
    }

    // Validar tipo MIME
    if (options.allowedTypes && file.type && !options.allowedTypes.includes(file.type.toLowerCase())) {
      const allowedExtensions = options.allowedTypes
        .map(type => type.split('/')[1].toUpperCase())
        .join(', ');
      resolve({
        isValid: false,
        error: `Tipo de archivo no válido. Solo se permiten: ${allowedExtensions}`
      });
      return;
    }

    // Si no hay tipo MIME, validar por extensión del nombre
    if (!file.type && file.name) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      
      if (extension && !validExtensions.includes(extension)) {
        resolve({
          isValid: false,
          error: `Tipo de archivo no válido. Solo se permiten: ${validExtensions.join(', ').toUpperCase()}`
        });
        return;
      }
    }

    // Validar extensión del archivo
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (fileExtension && !allowedExtensions.includes(fileExtension)) {
      resolve({
        isValid: false,
        error: `Extensión de archivo no válida. Solo se permiten: ${allowedExtensions.join(', ').toUpperCase()}`
      });
      return;
    }

    // Validar dimensiones (solo para imágenes)
    if (file.type.startsWith('image/') && (options.minWidth || options.minHeight || options.maxWidth || options.maxHeight)) {
      const img = new Image();
      img.onload = () => {
        let error: string | undefined;

        if (options.minWidth && img.width < options.minWidth) {
          error = `La imagen debe tener al menos ${options.minWidth}px de ancho`;
        } else if (options.minHeight && img.height < options.minHeight) {
          error = `La imagen debe tener al menos ${options.minHeight}px de alto`;
        } else if (options.maxWidth && img.width > options.maxWidth) {
          error = `La imagen no puede tener más de ${options.maxWidth}px de ancho`;
        } else if (options.maxHeight && img.height > options.maxHeight) {
          error = `La imagen no puede tener más de ${options.maxHeight}px de alto`;
        }

        resolve({
          isValid: !error,
          error,
          file: error ? undefined : file
        });
      };

      img.onerror = () => {
        resolve({
          isValid: false,
          error: 'No se pudo cargar la imagen. Verifica que el archivo no esté corrupto'
        });
      };

      img.src = URL.createObjectURL(file);
    } else {
      // Si no necesitamos validar dimensiones
      resolve({
        isValid: true,
        file
      });
    }
  });
}

// Función específica para validar archivos de categorías
export function validateCategoryImage(file: File): Promise<FileValidationResult> {
  return validateImageFile(file, {
    ...DEFAULT_IMAGE_OPTIONS,
    minWidth: 200,
    minHeight: 200,
  });
}

// Función específica para validar archivos de productos
export function validateProductImage(file: File): Promise<FileValidationResult> {
  return validateImageFile(file, {
    ...DEFAULT_IMAGE_OPTIONS,
    minWidth: 300,
    minHeight: 300,
  });
}

// Función para mostrar el tamaño del archivo de forma legible
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para validar múltiples archivos
export async function validateMultipleFiles(
  files: FileList, 
  options: FileValidationOptions = DEFAULT_IMAGE_OPTIONS
): Promise<{ valid: File[]; invalid: { file: File; error: string }[] }> {
  const valid: File[] = [];
  const invalid: { file: File; error: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await validateImageFile(file, options);
    
    if (result.isValid && result.file) {
      valid.push(result.file);
    } else {
      invalid.push({ file, error: result.error || 'Error desconocido' });
    }
  }

  return { valid, invalid };
}