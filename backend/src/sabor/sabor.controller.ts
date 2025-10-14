import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SaborService } from './services/sabor.service';
import { CreateSaborDto } from './dto/create-sabor.dto';
import { UpdateSaborDto } from './dto/update-sabor.dto';

@Controller('sabor')
export class SaborController {
  constructor(private readonly saborService: SaborService) {}

  @Post()
  async create(@Body() createSaborDto: CreateSaborDto) {
    return await this.saborService.create(createSaborDto);
  }

  @Get()
  async findAll() {
    return await this.saborService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.saborService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSaborDto: UpdateSaborDto,
  ) {
    return await this.saborService.update(id, updateSaborDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.saborService.remove(id);
  }
}
