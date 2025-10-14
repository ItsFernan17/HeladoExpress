import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PedidoService } from './services/pedido.service';
import { CreatePedidoCompleteDto } from './dto/create-pedido-complete.dto';

@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post('completo')
  @HttpCode(HttpStatus.CREATED)
  async createCompleto(@Body() dto: CreatePedidoCompleteDto) {
    return await this.pedidoService.createComplete(dto);
  }

  @Get('completos/todos')
  async getAllPedidosCompletos() {
    console.log('🔍 GET /completos/todos iniciado');
    return await this.pedidoService.getAllPedidosCompletos();
  }

  @Get('completos/:id')
  async getPedidoCompleto(@Param('id', ParseIntPipe) id: number) {
    console.log('🔍 GET /completos/:id iniciado con ID:', id);
    return await this.pedidoService.getPedidoCompleto(id);
  }

  @Patch(':id/estado/:estadoId')
  @HttpCode(HttpStatus.OK)
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('estadoId', ParseIntPipe) estadoId: number,
  ) {
    return await this.pedidoService.changeStatus(id, estadoId);
  }
}
