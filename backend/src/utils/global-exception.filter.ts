import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: string[] = [];

    // Log del error para debugging
    this.logger.error(
      `Error en ${request.method} ${request.url}:`,
      exception instanceof Error ? exception.stack : exception,
    );

    if (exception instanceof HttpException) {
      // Errores HTTP controlados
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        
        // Si message es un array (errores de validación), lo procesamos
        if (Array.isArray(responseObj.message)) {
          errors = responseObj.message;
          message = 'Errores de validación encontrados';
        }
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof QueryFailedError) {
      // Errores de base de datos
      status = HttpStatus.BAD_REQUEST;
      
      const error = exception as any;
      
      // Error de clave duplicada
      if (error.code === '23505' || error.message.includes('duplicate key')) {
        if (error.constraint) {
          if (error.constraint.includes('nombre')) {
            message = 'Ya existe un registro con ese nombre';
          } else {
            message = 'Ya existe un registro con esos datos';
          }
        } else {
          message = 'Registro duplicado';
        }
      }
      // Error de clave foránea
      else if (error.code === '23503' || error.message.includes('foreign key')) {
        message = 'No se puede completar la operación. Verifica que todos los datos relacionados existan';
      }
      // Error de restricción no nula
      else if (error.code === '23502' || error.message.includes('null value')) {
        message = 'Faltan campos obligatorios';
      }
      // Error de tipo de dato
      else if (error.code === '22P02' || error.message.includes('invalid input')) {
        message = 'Formato de datos inválido';
      }
      // Otros errores de base de datos
      else {
        message = 'Error en la base de datos';
      }
    } else if (exception instanceof Error) {
      // Otros errores conocidos
      if (exception.message.includes('ENOENT')) {
        status = HttpStatus.NOT_FOUND;
        message = 'Archivo no encontrado';
      } else if (exception.message.includes('EACCES')) {
        status = HttpStatus.FORBIDDEN;
        message = 'Sin permisos para acceder al archivo';
      } else if (exception.message.includes('File too large')) {
        status = HttpStatus.PAYLOAD_TOO_LARGE;
        message = 'El archivo es demasiado grande';
      } else if (exception.message.includes('Unexpected token')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Formato JSON inválido';
      } else {
        message = exception.message || 'Error desconocido';
      }
    }

    // Respuesta estructurada
    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      ...(errors.length > 0 && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    response.status(status).json(errorResponse);
  }
}