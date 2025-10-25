import { config } from "@/utils/config";

// Tipos para respuestas de error estructuradas
interface ErrorResponse {
  success?: boolean;
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp?: string;
  path?: string;
  method?: string;
}

// Función para extraer mensajes de error más específicos
function extractErrorMessage(errorData: any): string {
  // Si hay errores de validación múltiples
  if (errorData.errors && Array.isArray(errorData.errors)) {
    return errorData.errors.join('. ');
  }
  
  // Si hay un mensaje principal
  if (errorData.message) {
    // Si el mensaje es un array (errores de validación)
    if (Array.isArray(errorData.message)) {
      return errorData.message.join('. ');
    }
    return errorData.message;
  }
  
  // Mensajes por defecto basados en códigos de estado
  return 'Error en el servidor';
}

// Función para obtener mensajes de error amigables por código de estado
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Datos inválidos. Verifica la información ingresada';
    case 401:
      return 'No autorizado. Inicia sesión nuevamente';
    case 403:
      return 'No tienes permisos para realizar esta acción';
    case 404:
      return 'Recurso no encontrado';
    case 409:
      return 'Conflicto. El recurso ya existe';
    case 413:
      return 'Archivo demasiado grande';
    case 415:
      return 'Tipo de archivo no soportado';
    case 422:
      return 'Datos no procesables. Verifica los campos';
    case 429:
      return 'Demasiadas solicitudes. Intenta más tarde';
    case 500:
      return 'Error interno del servidor';
    case 502:
      return 'Servidor no disponible temporalmente';
    case 503:
      return 'Servicio no disponible';
    default:
      return 'Error desconocido en el servidor';
  }
}

export async function http<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const fullUrl = `http://${hostname}:3001/api/v1${path}`;
  
  try {
    const res = await fetch(fullUrl, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      cache: "no-store",
      ...options,
    });
    
    if (!res.ok) {
      let errorMessage = getDefaultErrorMessage(res.status);
      
      try {
        const errorData = await res.json() as ErrorResponse;
        errorMessage = extractErrorMessage(errorData);
      } catch (parseError) {
        // Si no se puede parsear la respuesta, usar el mensaje por defecto
        console.warn('No se pudo parsear la respuesta de error:', parseError);
      }
      
      // Si es 404 en la ruta de pedidos, probablemente no hay pedidos
      if (res.status === 404 && path.includes('/pedido/completos/todos')) {
        return [] as T; // Devolver array vacío en lugar de error
      }
      
      // Crear un error estructurado que incluya el código de estado
      const error = new Error(errorMessage) as Error & { status: number; statusText: string };
      error.status = res.status;
      error.statusText = res.statusText;
      
      throw error;
    }
    
    return res.json() as Promise<T>;
  } catch (networkError) {
    // Errores de red (sin conexión, timeout, etc.)
    if (networkError instanceof TypeError && networkError.message.includes('fetch')) {
      const error = new Error('Sin conexión al servidor. Verifica tu conexión a internet') as Error & { status: number };
      error.status = 0;
      throw error;
    }
    
    // Re-lanzar otros errores
    throw networkError;
  }
}
