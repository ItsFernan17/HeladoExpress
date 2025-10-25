import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ImageService } from './services/image.service';
import { ImageController } from './image.controller';
import { ImageRepository } from './repositories/image.repository';
import { Image } from './entities/image.entity';
import { MulterConfigService } from '../upload/multer-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService, ImageRepository, MulterConfigService],
  exports: [ImageService],
})
export class ImageModule {}