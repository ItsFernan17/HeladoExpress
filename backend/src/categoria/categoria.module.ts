import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaService } from './services/categoria.service';
import { CategoriaController } from './categoria.controller';
import { Categoria } from './entities/categoria.entity';
import { CategoriaRepository } from './repositories/categoria.repository';
import { CategoriaSeeder } from './seeds/categoria.seed';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria])],
  controllers: [CategoriaController],
  providers: [CategoriaService, CategoriaRepository, CategoriaSeeder],
  exports: [CategoriaService, CategoriaRepository, CategoriaSeeder],
})
export class CategoriaModule {}
