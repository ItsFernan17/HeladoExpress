import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { PedidoItemComplementoService } from './pedido-item-complemento.service';
import { CreatePedidoItemComplementoDto } from './Dto/create-pedido-item-complemento.dto';
import { UpdatePedidoItemComplementoDto } from './Dto/update-pedido-item-complemento.dto';
import { DeletePedidoItemComplementoDto } from './Dto/delete-pedido-item-complemento.dto';
import { IPedidoItemComplemento } from './Interfaces/pedido-item-complemento.interface';

@Controller('pedido-item-complemento')
export class PedidoItemComplementoController {
  constructor(private readonly pedidoItemComplementoService: PedidoItemComplementoService) {}

  // GET todos los pedido item complementos
  @Get()
  async findAll(): Promise<IPedidoItemComplemento[]> {
    return await this.pedidoItemComplementoService.findAll();
  }

  // GET pedido item complemento por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<IPedidoItemComplemento> {
    return await this.pedidoItemComplementoService.findOne(id);
  }

  // POST crear nuevo pedido item complemento
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPedidoItemComplementoDto: CreatePedidoItemComplementoDto): Promise<IPedidoItemComplemento> {
    return await this.pedidoItemComplementoService.create(createPedidoItemComplementoDto);
  }

  // PUT actualizar pedido item complemento
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePedidoItemComplementoDto: UpdatePedidoItemComplementoDto
  ): Promise<IPedidoItemComplemento> {
    return await this.pedidoItemComplementoService.update(id, updatePedidoItemComplementoDto);
  }

  // DELETE eliminación lógica
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() deletePedidoItemComplementoDto: DeletePedidoItemComplementoDto
  ): Promise<{ message: string }> {
    return await this.pedidoItemComplementoService.remove(id, deletePedidoItemComplementoDto.usuario_modifica);
  }

  // Métodos adicionales
  @Get('pedido-item/:pedidoItemId')
  async findByPedidoItem(@Param('pedidoItemId', ParseIntPipe) pedidoItemId: number): Promise<IPedidoItemComplemento[]> {
    return await this.pedidoItemComplementoService.findByPedidoItem(pedidoItemId);
  }

  @Get('complemento/:complementoId')
  async findByComplemento(@Param('complementoId', ParseIntPipe) complementoId: number): Promise<IPedidoItemComplemento[]> {
    return await this.pedidoItemComplementoService.findByComplemento(complementoId);
  }

  @Get('search/precio')
  async findByPrecioRange(
    @Query('min') precioMin: number,
    @Query('max') precioMax: number
  ): Promise<IPedidoItemComplemento[]> {
    return await this.pedidoItemComplementoService.findByPrecioRange(precioMin, precioMax);
  }

  @Get('usuario/:usuarioId')
  async findByUsuarioIngreso(@Param('usuarioId', ParseIntPipe) usuarioId: number): Promise<IPedidoItemComplemento[]> {
    return await this.pedidoItemComplementoService.findByUsuarioIngreso(usuarioId);
  }

  @Get('stats/overview')
  async getStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    return await this.pedidoItemComplementoService.getStats();
  }

  @Put(':id/reactivate')
  async reactivate(@Param('id', ParseIntPipe) id: number): Promise<IPedidoItemComplemento> {
    return await this.pedidoItemComplementoService.reactivate(id);
  }

  @Get('top/expensive')
  async getMostExpensive(@Query('limit') limit: number = 5): Promise<IPedidoItemComplemento[]> {
    return await this.pedidoItemComplementoService.getMostExpensive(limit);
  }

  @Get('pedido-item/:pedidoItemId/total')
  async calculatePedidoItemComplementosTotal(@Param('pedidoItemId', ParseIntPipe) pedidoItemId: number): Promise<{ total: number; complementoCount: number }> {
    return await this.pedidoItemComplementoService.calculatePedidoItemComplementosTotal(pedidoItemId);
  }

  @Get('top/popular')
  async getMostPopularComplementos(@Query('limit') limit: number = 5): Promise<{ complemento_id: number; total_quantity: number; total_revenue: number }[]> {
    return await this.pedidoItemComplementoService.getMostPopularComplementos(limit);
  }
}
