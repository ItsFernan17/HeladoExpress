import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoService } from './services/producto.service';
import { ProductoController } from './producto.controller';
import { Producto } from './entities/producto.entity';
import { ProductoRepository } from './repositories/producto.repository';
import { CategoriaModule } from '../categoria/categoria.module';
import { UploadModule } from '../upload/upload.module';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]),
    CategoriaModule, // Importamos CategoriaModule para usar CategoriaService
    UploadModule,
    ImageModule,
  ],
  controllers: [ProductoController],
  providers: [ProductoService, ProductoRepository],
  exports: [ProductoService, ProductoRepository],
})
export class ProductoModule {}
