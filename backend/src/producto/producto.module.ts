import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoService } from './services/producto.service';
import { ProductoController } from './producto.controller';
import { Producto } from './entities/producto.entity';
import { ProductoRepository } from './repositories/producto.repository';
import { CategoriaModule } from '../categoria/categoria.module';
import { ProductoSeeder } from './seeds/producto.seed';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]),
    CategoriaModule, // Importamos CategoriaModule para usar CategoriaService
  ],
  controllers: [ProductoController],
  providers: [ProductoService, ProductoRepository, ProductoSeeder],
  exports: [ProductoService, ProductoRepository, ProductoSeeder],
})
export class ProductoModule {}
