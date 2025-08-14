import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { SaborService } from './sabor.service';
import { CreateSaborDto } from './Dto/create-sabor.dto';
import { UpdateSaborDto } from './Dto/update-sabor.dto';
import { DeleteSaborDto } from './Dto/delete-sabor.dto';
import { ISabor } from './Interfaces/sabor.interface';

@Controller('sabor')
export class SaborController {
  constructor(private readonly saborService: SaborService) {}

  // GET todos los sabores
  @Get()
  async findAll(): Promise<ISabor[]> {
    return await this.saborService.findAll();
  }

  // GET sabor por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ISabor> {
    return await this.saborService.findOne(id);
  }

  // POST crear nuevo sabor
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSaborDto: CreateSaborDto): Promise<ISabor> {
    return await this.saborService.create(createSaborDto);
  }

  // PUT actualizar sabor
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSaborDto: UpdateSaborDto
  ): Promise<ISabor> {
    return await this.saborService.update(id, updateSaborDto);
  }

  // DELETE eliminación lógica
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() deleteSaborDto: DeleteSaborDto
  ): Promise<{ message: string }> {
    return await this.saborService.remove(id, deleteSaborDto.usuario_modifica);
  }
}
