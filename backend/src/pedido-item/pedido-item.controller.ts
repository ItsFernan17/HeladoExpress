import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { PedidoItemService } from './pedido-item.service';
import { CreatePedidoItemDto } from './Dto/create-pedido-item.dto';
import { UpdatePedidoItemDto } from './Dto/update-pedido-item.dto';
import { DeletePedidoItemDto } from './Dto/delete-pedido-item.dto';
import { IPedidoItem } from './Interfaces/pedido-item.interface';

@Controller('pedido-item')
export class PedidoItemController {
  constructor(private readonly pedidoItemService: PedidoItemService) {}

  // GET todos los pedido items
  @Get()
  async findAll(): Promise<IPedidoItem[]> {
    return await this.pedidoItemService.findAll();
  }

  // GET pedido item por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<IPedidoItem> {
    return await this.pedidoItemService.findOne(id);
  }

  // POST crear nuevo pedido item
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPedidoItemDto: CreatePedidoItemDto): Promise<IPedidoItem> {
    return await this.pedidoItemService.create(createPedidoItemDto);
  }

  // PUT actualizar pedido item
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePedidoItemDto: UpdatePedidoItemDto
  ): Promise<IPedidoItem> {
    return await this.pedidoItemService.update(id, updatePedidoItemDto);
  }

  // DELETE eliminación lógica
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() deletePedidoItemDto: DeletePedidoItemDto
  ): Promise<{ message: string }> {
    return await this.pedidoItemService.remove(id, deletePedidoItemDto.usuario_modifica);
  }

  // Métodos adicionales
  @Get('pedido/:pedidoId')
  async findByPedido(@Param('pedidoId', ParseIntPipe) pedidoId: number): Promise<IPedidoItem[]> {
    return await this.pedidoItemService.findByPedido(pedidoId);
  }

  @Get('tipo-helado/:tipoHeladoId')
  async findByTipoHelado(@Param('tipoHeladoId', ParseIntPipe) tipoHeladoId: number): Promise<IPedidoItem[]> {
    return await this.pedidoItemService.findByTipoHelado(tipoHeladoId);
  }

  @Get('search/precio')
  async findByPrecioRange(
    @Query('min') precioMin: number,
    @Query('max') precioMax: number
  ): Promise<IPedidoItem[]> {
    return await this.pedidoItemService.findByPrecioRange(precioMin, precioMax);
  }

  @Get('usuario/:usuarioId')
  async findByUsuarioIngreso(@Param('usuarioId', ParseIntPipe) usuarioId: number): Promise<IPedidoItem[]> {
    return await this.pedidoItemService.findByUsuarioIngreso(usuarioId);
  }

  @Get('stats/overview')
  async getStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    return await this.pedidoItemService.getStats();
  }

  @Put(':id/reactivate')
  async reactivate(@Param('id', ParseIntPipe) id: number): Promise<IPedidoItem> {
    return await this.pedidoItemService.reactivate(id);
  }

  @Get('top/expensive')
  async getMostExpensive(@Query('limit') limit: number = 5): Promise<IPedidoItem[]> {
    return await this.pedidoItemService.getMostExpensive(limit);
  }

  @Get('pedido/:pedidoId/total')
  async calculatePedidoTotal(@Param('pedidoId', ParseIntPipe) pedidoId: number): Promise<{ total: number; itemCount: number }> {
    return await this.pedidoItemService.calculatePedidoTotal(pedidoId);
  }
}
