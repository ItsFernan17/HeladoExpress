import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './services/image.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  create(@Body() createImageDto: CreateImageDto) {
    return this.imageService.create(createImageDto);
  }

  @Get()
  findAll(@Query('entity_type') entity_type?: 'categoria' | 'producto') {
    if (entity_type) {
      return this.imageService.findByEntityType(entity_type);
    }
    return this.imageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imageService.findById(+id);
  }

  @Get('entity/:entity_type/:entity_id')
  findByEntity(
    @Param('entity_type') entity_type: 'categoria' | 'producto',
    @Param('entity_id') entity_id: string
  ) {
    return this.imageService.findByEntity(entity_type, +entity_id);
  }

  @Post('upload/:entity_type/:entity_id')
  @UseInterceptors(FileInterceptor('image'))
  uploadEntityImage(
    @Param('entity_type') entity_type: 'categoria' | 'producto',
    @Param('entity_id') entity_id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.imageService.replaceEntityImage(entity_type, +entity_id, file);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imageService.update(+id, updateImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imageService.delete(+id);
  }

  @Delete('entity/:entity_type/:entity_id')
  removeByEntity(
    @Param('entity_type') entity_type: 'categoria' | 'producto',
    @Param('entity_id') entity_id: string
  ) {
    return this.imageService.deleteByEntity(entity_type, +entity_id);
  }
}