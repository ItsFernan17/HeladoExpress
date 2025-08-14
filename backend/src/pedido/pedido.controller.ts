import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './Dto/create-pedido.dto';
import { UpdatePedidoDto } from './Dto/update-pedido.dto';
import { DeletePedidoDto } from './Dto/delete-pedido.dto';
import { IPedido } from './Interfaces/pedido.interface';

@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  // GET todos los pedidos
  @Get()
  async findAll(): Promise<IPedido[]> {
    return await this.pedidoService.findAll();
  }

  // GET pedido por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<IPedido> {
    return await this.pedidoService.findOne(id);
  }

  // POST crear nuevo pedido
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPedidoDto: CreatePedidoDto): Promise<IPedido> {
    return await this.pedidoService.create(createPedidoDto);
  }

  // PUT actualizar pedido
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePedidoDto: UpdatePedidoDto
  ): Promise<IPedido> {
    return await this.pedidoService.update(id, updatePedidoDto);
  }

  // DELETE eliminación lógica
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() deletePedidoDto: DeletePedidoDto
  ): Promise<{ message: string }> {
    return await this.pedidoService.remove(id, deletePedidoDto.usuario_modifica);
  }

  // Métodos adicionales
  @Get('search/codigo/:codigo')
  async searchByCodigo(@Param('codigo') codigo: string): Promise<IPedido[]> {
    return await this.pedidoService.searchByCodigo(codigo);
  }

  @Get('estado/:estado')
  async findByEstado(@Param('estado') estado: string): Promise<IPedido[]> {
    return await this.pedidoService.findByEstado(estado);
  }

  @Get('usuario/:usuarioId')
  async findByUsuarioIngreso(@Param('usuarioId', ParseIntPipe) usuarioId: number): Promise<IPedido[]> {
    return await this.pedidoService.findByUsuarioIngreso(usuarioId);
  }

  @Get('stats/overview')
  async getStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    return await this.pedidoService.getStats();
  }

  @Put(':id/reactivate')
  async reactivate(@Param('id', ParseIntPipe) id: number): Promise<IPedido> {
    return await this.pedidoService.reactivate(id);
  }

  @Get('generate/codigo')
  async generateUniqueCodigo(): Promise<{ codigo: string }> {
    const codigo = await this.pedidoService.generateUniqueCodigo();
    return { codigo };
  }
}
