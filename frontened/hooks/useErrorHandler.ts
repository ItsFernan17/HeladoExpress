import { useToast } from '@/hooks/useToast';

// Tipos para errores HTTP extendidos
interface HttpError extends Error {
  status?: number;
  statusText?: string;
}

// Hook personalizado para manejo de errores
export function useErrorHandler() {
  const { showError, showWarning } = useToast();

  const handleError = (error: unknown, defaultMessage?: string) => {
    console.error('Error capturado:', error);

    let message = defaultMessage || 'Ha ocurrido un error inesperado';
    let isWarning = false;

    if (error instanceof Error) {
      const httpError = error as HttpError;
      
      // Usar el mensaje del error si está disponible
      if (error.message && error.message !== 'fetch') {
        message = error.message;
      }

      // Personalizar mensajes según el tipo de error o código de estado
      if (httpError.status) {
        switch (httpError.status) {
          case 0:
            message = 'Sin conexión al servidor. Verifica tu conexión a internet';
            break;
          case 400:
            // Errores de validación - usar mensaje específico del servidor
            break;
          case 401:
            message = 'Sesión expirada. Inicia sesión nuevamente';
            break;
          case 403:
            message = 'No tienes permisos para realizar esta acción';
            break;
          case 404:
            message = 'El recurso solicitado no fue encontrado';
            isWarning = true;
            break;
          case 409:
            // Conflictos (duplicados) - usar mensaje específico del servidor
            isWarning = true;
            break;
          case 413:
            message = 'El archivo es demasiado grande. Máximo 5MB permitido';
            break;
          case 415:
            message = 'Tipo de archivo no válido. Solo se permiten imágenes';
            break;
          case 422:
            message = 'Los datos proporcionados no son válidos';
            break;
          case 429:
            message = 'Demasiadas solicitudes. Espera un momento e intenta nuevamente';
            isWarning = true;
            break;
          case 500:
            message = 'Error interno del servidor. Intenta nuevamente más tarde';
            break;
          case 502:
          case 503:
            message = 'Servidor temporalmente no disponible. Intenta más tarde';
            break;
        }
      }

      // Detectar tipos específicos de errores por contenido del mensaje
      if (error.message.toLowerCase().includes('network') || 
          error.message.toLowerCase().includes('fetch')) {
        message = 'Error de conexión. Verifica tu conexión a internet';
      } else if (error.message.toLowerCase().includes('timeout')) {
        message = 'La solicitud tardó demasiado. Intenta nuevamente';
      } else if (error.message.toLowerCase().includes('cors')) {
        message = 'Error de configuración del servidor';
      } else if (error.message.toLowerCase().includes('unauthorized')) {
        message = 'No tienes permisos para realizar esta acción';
      } else if (error.message.toLowerCase().includes('validation')) {
        message = 'Datos inválidos. Revisa los campos ingresados';
      } else if (error.message.toLowerCase().includes('duplicate') || 
                 error.message.toLowerCase().includes('duplicado')) {
        message = error.message; // Mantener mensaje específico de duplicado
        isWarning = true;
      } else if (error.message.toLowerCase().includes('formato') || 
                 error.message.toLowerCase().includes('invalid input')) {
        message = 'Formato de datos incorrecto';
      } else if (error.message.toLowerCase().includes('campo obligatorio') || 
                 error.message.toLowerCase().includes('requerido')) {
        message = 'Faltan campos obligatorios';
      }
    }

    // Mostrar el toast apropiado
    if (isWarning) {
      showWarning(message);
    } else {
      showError(message);
    }

    return message;
  };

  // Función específica para errores de validación de formularios
  const handleValidationError = (error: unknown) => {
    if (error instanceof Error) {
      // Extraer mensajes de validación específicos
      let message = error.message;
      
      // Si el error contiene información sobre validación
      if (message.includes('Errores de validación:')) {
        message = message.replace('Errores de validación: ', '');
      }
      
      showError(message);
      return message;
    }
    
    return handleError(error, 'Error de validación en el formulario');
  };

  // Función específica para errores de archivos
  const handleFileError = (error: unknown) => {
    if (error instanceof Error) {
      let message = error.message;
      
      // Mensajes específicos para errores de archivos
      if (message.toLowerCase().includes('file too large')) {
        message = 'El archivo es demasiado grande. Tamaño máximo: 5MB';
      } else if (message.toLowerCase().includes('invalid file type')) {
        message = 'Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, WEBP, GIF)';
      } else if (message.toLowerCase().includes('no file selected')) {
        message = 'Debes seleccionar un archivo';
      }
      
      showError(message);
      return message;
    }
    
    return handleError(error, 'Error al procesar el archivo');
  };

  // Función para errores de operaciones CRUD
  const handleCrudError = (operation: 'crear' | 'actualizar' | 'eliminar' | 'obtener', entity: string) => {
    return (error: unknown) => {
      const defaultMessages = {
        crear: `Error al crear ${entity}`,
        actualizar: `Error al actualizar ${entity}`,
        eliminar: `Error al eliminar ${entity}`,
        obtener: `Error al obtener ${entity}`
      };
      
      return handleError(error, defaultMessages[operation]);
    };
  };

  return {
    handleError,
    handleValidationError,
    handleFileError,
    handleCrudError
  };
}

// Función helper para uso sin hook (en contextos donde no se pueden usar hooks)
export function handleErrorStatic(error: unknown, showErrorFn: (message: string) => void) {
  console.error('Error capturado:', error);

  let message = 'Ha ocurrido un error inesperado';

  if (error instanceof Error) {
    const httpError = error as HttpError;
    
    if (error.message && error.message !== 'fetch') {
      message = error.message;
    }

    // Mensajes específicos por código de estado
    if (httpError.status === 0) {
      message = 'Sin conexión al servidor';
    } else if (httpError.status === 413) {
      message = 'Archivo demasiado grande (máximo 5MB)';
    } else if (httpError.status === 415) {
      message = 'Tipo de archivo no válido';
    }
  }

  showErrorFn(message);
  return message;
}