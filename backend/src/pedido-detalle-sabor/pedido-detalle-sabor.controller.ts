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
import { PedidoDetalleSaborService } from './services/pedido-detalle-sabor.service';
import { CreatePedidoDetalleSaborDto } from './dto/create-pedido-detalle-sabor.dto';
import { UpdatePedidoDetalleSaborDto } from './dto/update-pedido-detalle-sabor.dto';

@Controller('pedido-detalle-sabor')
export class PedidoDetalleSaborController {
  constructor(private readonly pedidoDetalleSaborService: PedidoDetalleSaborService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPedidoDetalleSaborDto: CreatePedidoDetalleSaborDto) {
    return await this.pedidoDetalleSaborService.create(createPedidoDetalleSaborDto);
  }

  @Get()
  async findAll() {
    return await this.pedidoDetalleSaborService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.pedidoDetalleSaborService.findOneById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePedidoDetalleSaborDto: UpdatePedidoDetalleSaborDto,
  ) {
    return await this.pedidoDetalleSaborService.updateById(id, updatePedidoDetalleSaborDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.pedidoDetalleSaborService.removeById(id);
  }
}
