import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaService } from './services/categoria.service';
import { CategoriaController } from './categoria.controller';
import { Categoria } from './entities/categoria.entity';
import { CategoriaRepository } from './repositories/categoria.repository';
import { UploadModule } from '../upload/upload.module';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria]),
    UploadModule,
    ImageModule,
  ],
  controllers: [CategoriaController],
  providers: [CategoriaService, CategoriaRepository],
  exports: [CategoriaService, CategoriaRepository],
})
export class CategoriaModule {}
