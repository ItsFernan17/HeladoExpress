import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { PedidoItemBolaService } from './pedido-item-bola.service';
import { CreatePedidoItemBolaDto } from './Dto/create-pedido-item-bola.dto';
import { UpdatePedidoItemBolaDto } from './Dto/update-pedido-item-bola.dto';
import { DeletePedidoItemBolaDto } from './Dto/delete-pedido-item-bola.dto';
import { IPedidoItemBola } from './Interfaces/pedido-item-bola.interface';

@Controller('pedido-item-bola')
export class PedidoItemBolaController {
  constructor(private readonly pedidoItemBolaService: PedidoItemBolaService) {}

  // GET todos los pedido item bolas
  @Get()
  async findAll(): Promise<IPedidoItemBola[]> {
    return await this.pedidoItemBolaService.findAll();
  }

  // GET pedido item bola por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<IPedidoItemBola> {
    return await this.pedidoItemBolaService.findOne(id);
  }

  // POST crear nuevo pedido item bola
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPedidoItemBolaDto: CreatePedidoItemBolaDto): Promise<IPedidoItemBola> {
    return await this.pedidoItemBolaService.create(createPedidoItemBolaDto);
  }

  // PUT actualizar pedido item bola
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePedidoItemBolaDto: UpdatePedidoItemBolaDto
  ): Promise<IPedidoItemBola> {
    return await this.pedidoItemBolaService.update(id, updatePedidoItemBolaDto);
  }

  // DELETE eliminación lógica
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() deletePedidoItemBolaDto: DeletePedidoItemBolaDto
  ): Promise<{ message: string }> {
    return await this.pedidoItemBolaService.remove(id, deletePedidoItemBolaDto.usuario_modifica);
  }

  // Métodos adicionales
  @Get('pedido-item/:pedidoItemId')
  async findByPedidoItem(@Param('pedidoItemId', ParseIntPipe) pedidoItemId: number): Promise<IPedidoItemBola[]> {
    return await this.pedidoItemBolaService.findByPedidoItem(pedidoItemId);
  }

  @Get('sabor/:saborId')
  async findBySabor(@Param('saborId', ParseIntPipe) saborId: number): Promise<IPedidoItemBola[]> {
    return await this.pedidoItemBolaService.findBySabor(saborId);
  }

  @Get('usuario/:usuarioId')
  async findByUsuarioIngreso(@Param('usuarioId', ParseIntPipe) usuarioId: number): Promise<IPedidoItemBola[]> {
    return await this.pedidoItemBolaService.findByUsuarioIngreso(usuarioId);
  }

  @Get('stats/overview')
  async getStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    return await this.pedidoItemBolaService.getStats();
  }

  @Put(':id/reactivate')
  async reactivate(@Param('id', ParseIntPipe) id: number): Promise<IPedidoItemBola> {
    return await this.pedidoItemBolaService.reactivate(id);
  }

  @Get('top/popular')
  async getMostPopularSabores(@Query('limit') limit: number = 5): Promise<{ sabor_id: number; total_quantity: number }[]> {
    return await this.pedidoItemBolaService.getMostPopularSabores(limit);
  }

  @Get('pedido-item/:pedidoItemId/count')
  async countBolasByPedidoItem(@Param('pedidoItemId', ParseIntPipe) pedidoItemId: number): Promise<{ bolaCount: number }> {
    return await this.pedidoItemBolaService.countBolasByPedidoItem(pedidoItemId);
  }
}
