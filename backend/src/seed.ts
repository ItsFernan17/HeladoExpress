import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseSeeder } from './database.seeder';

async function runSeeder() {
  console.log('🌱 Ejecutando seeder...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(DatabaseSeeder);
  
  try {
    await seeder.seedAll();
    console.log('🎉 Seeding completado exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando seeder:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeeder();
