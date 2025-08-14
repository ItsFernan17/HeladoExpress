import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ComplementoService } from './complemento.service';
import { CreateComplementoDto } from './Dto/create-complemento.dto';
import { UpdateComplementoDto } from './Dto/update-complemento.dto';
import { DeleteComplementoDto } from './Dto/delete-complemento.dto';
import { IComplemento } from './Interfaces/complemento.interface';

@Controller('complemento')
export class ComplementoController {
  constructor(private readonly complementoService: ComplementoService) {}

  // GET todos los complementos
  @Get()
  async findAll(): Promise<IComplemento[]> {
    return await this.complementoService.findAll();
  }

  // GET complemento por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<IComplemento> {
    return await this.complementoService.findOne(id);
  }

  // POST crear nuevo complemento
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createComplementoDto: CreateComplementoDto): Promise<IComplemento> {
    return await this.complementoService.create(createComplementoDto);
  }

  // PUT actualizar complemento
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateComplementoDto: UpdateComplementoDto
  ): Promise<IComplemento> {
    return await this.complementoService.update(id, updateComplementoDto);
  }

  // DELETE eliminación lógica
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() deleteComplementoDto: DeleteComplementoDto
  ): Promise<{ message: string }> {
    return await this.complementoService.remove(id, deleteComplementoDto.usuario_modifica);
  }

  // Métodos adicionales
  @Get('search/nombre/:nombre')
  async searchByName(@Param('nombre') nombre: string): Promise<IComplemento[]> {
    return await this.complementoService.searchByName(nombre);
  }

  @Get('search/precio')
  async findByPrecioRange(
    @Query('min') precioMin: number,
    @Query('max') precioMax: number
  ): Promise<IComplemento[]> {
    return await this.complementoService.findByPrecioRange(precioMin, precioMax);
  }

  @Get('usuario/:usuarioId')
  async findByUsuarioIngreso(@Param('usuarioId', ParseIntPipe) usuarioId: number): Promise<IComplemento[]> {
    return await this.complementoService.findByUsuarioIngreso(usuarioId);
  }

  @Get('stats/overview')
  async getStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    return await this.complementoService.getStats();
  }

  @Put(':id/reactivate')
  async reactivate(@Param('id', ParseIntPipe) id: number): Promise<IComplemento> {
    return await this.complementoService.reactivate(id);
  }

  @Get('top/expensive')
  async getMostExpensive(@Query('limit') limit: number = 5): Promise<IComplemento[]> {
    return await this.complementoService.getMostExpensive(limit);
  }
}
