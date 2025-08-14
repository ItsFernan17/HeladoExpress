import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { TipoHeladoService } from './tipo-helado.service';
import { CreateTipoHeladoDto } from './Dto/create-tipo-helado.dto';
import { UpdateTipoHeladoDto } from './Dto/update-tipo-helado.dto';
import { DeleteTipoHeladoDto } from './Dto/delete-tipo-helado.dto';
import { ITipoHelado } from './Interfaces/tipo-helado.interface';

@Controller('tipo-helado')
export class TipoHeladoController {
  constructor(private readonly tipoHeladoService: TipoHeladoService) {}

  // GET todos los tipos de helado
  @Get()
  async findAll(): Promise<ITipoHelado[]> {
    return await this.tipoHeladoService.findAll();
  }

  // GET tipo de helado por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ITipoHelado> {
    return await this.tipoHeladoService.findOne(id);
  }

  // POST crear nuevo tipo de helado
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTipoHeladoDto: CreateTipoHeladoDto): Promise<ITipoHelado> {
    return await this.tipoHeladoService.create(createTipoHeladoDto);
  }

  // PUT actualizar tipo de helado
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoHeladoDto: UpdateTipoHeladoDto
  ): Promise<ITipoHelado> {
    return await this.tipoHeladoService.update(id, updateTipoHeladoDto);
  }

  // DELETE eliminación lógica
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() deleteTipoHeladoDto: DeleteTipoHeladoDto
  ): Promise<{ message: string }> {
    return await this.tipoHeladoService.remove(id, deleteTipoHeladoDto.usuario_modifica);
  }

  // Métodos adicionales
  @Get('search/:nombre')
  async searchByName(@Param('nombre') nombre: string): Promise<ITipoHelado[]> {
    return await this.tipoHeladoService.searchByName(nombre);
  }

  @Get('usuario/:usuarioId')
  async findByUsuarioIngreso(@Param('usuarioId', ParseIntPipe) usuarioId: number): Promise<ITipoHelado[]> {
    return await this.tipoHeladoService.findByUsuarioIngreso(usuarioId);
  }

  @Get('stats/overview')
  async getStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    return await this.tipoHeladoService.getStats();
  }

  @Put(':id/reactivate')
  async reactivate(@Param('id', ParseIntPipe) id: number): Promise<ITipoHelado> {
    return await this.tipoHeladoService.reactivate(id);
  }
}
