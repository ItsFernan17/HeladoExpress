import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DetallePedidoService } from './services/detalle-pedido.service';
import { CreateDetallePedidoDto } from './dto/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from './dto/update-detalle-pedido.dto';
import { CalculateSubtotalDto } from './dto/calculate-subtotal.dto';
import { ValidatePrecioDto } from './dto/validate-precio.dto';

@Controller('detalle-pedido')
export class DetallePedidoController {
  constructor(private readonly detallePedidoService: DetallePedidoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDetallePedidoDto: CreateDetallePedidoDto) {
    return await this.detallePedidoService.create(createDetallePedidoDto);
  }

  @Get()
  async findAll() {
    return await this.detallePedidoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.detallePedidoService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDetallePedidoDto: UpdateDetallePedidoDto,
  ) {
    return await this.detallePedidoService.update(id, updateDetallePedidoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.detallePedidoService.remove(id);
  }

  @Get('pedido/:pedidoId')
  async findByPedido(@Param('pedidoId', ParseIntPipe) pedidoId: number) {
    return await this.detallePedidoService.findByPedido(pedidoId);
  }

  @Get('pedido/:pedidoId/total')
  async getTotalPedido(@Param('pedidoId', ParseIntPipe) pedidoId: number) {
    return await this.detallePedidoService.getTotalPedido(pedidoId);
  }

  @Patch(':id/cantidad/:cantidad')
  async updateCantidad(
    @Param('id', ParseIntPipe) id: number,
    @Param('cantidad', ParseIntPipe) cantidad: number,
  ) {
    return await this.detallePedidoService.updateCantidad(id, cantidad);
  }

  @Delete('pedido/:pedidoId/all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllByPedido(@Param('pedidoId', ParseIntPipe) pedidoId: number) {
    return await this.detallePedidoService.deleteAllByPedido(pedidoId);
  }

  @Post('calculate-subtotal')
  async calculateSubtotal(@Body() calculateSubtotalDto: CalculateSubtotalDto) {
    return await this.detallePedidoService.calculateSubtotal(
      calculateSubtotalDto.cantidad, 
      calculateSubtotalDto.precioUnitario
    );
  }

  @Post('validate-precio')
  async validatePrecio(@Body() validatePrecioDto: ValidatePrecioDto) {
    return await this.detallePedidoService.validatePrecioWithProduct(
      validatePrecioDto.productoId, 
      validatePrecioDto.precioUnitario
    );
  }
}
