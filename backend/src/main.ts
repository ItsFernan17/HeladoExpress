import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GlobalExceptionFilter } from './utils/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir archivos estáticos (imágenes) - DEBE ir ANTES del prefijo global
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/api/v1/uploads/',
  });

  // Filtro global de excepciones
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const messages = errors.flatMap(error => 
          Object.values(error.constraints || {})
        );
        return new Error(`Errores de validación: ${messages.join(', ')}`);
      },
    }),
  );

  // Prefijo global
  app.setGlobalPrefix('api/v1');

  // 🔓 CORS (habilitar antes de listen)
  app.enableCors({
    origin: [
      'http://localhost:3000', // tu Next.js en dev
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // pon true si vas a usar cookies/autenticación con credenciales
    optionsSuccessStatus: 204,
  });

  // Escuchar
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
