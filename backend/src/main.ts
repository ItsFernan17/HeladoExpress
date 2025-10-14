import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DatabaseSeeder } from './database.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Seeding opcional
  if (process.env.RUN_SEEDER === 'true') {
    console.log('🌱 Ejecutando seeding automático...');
    const seeder = app.get(DatabaseSeeder);
    await seeder.seedAll();
  }

  // Prefijo global
  app.setGlobalPrefix('api/v1');

  // 🔓 CORS (habilitar antes de listen)
  app.enableCors({
    origin: [
      'http://localhost:3001', // tu Next.js en dev
      // agrega aquí tu dominio en prod, p.ej. 'https://dideduchuehue.gob.gt'
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // pon true si vas a usar cookies/autenticación con credenciales
    optionsSuccessStatus: 204,
  });

  // Escuchar
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
