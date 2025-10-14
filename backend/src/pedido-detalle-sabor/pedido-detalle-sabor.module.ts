import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoDetalleSabor } from './entities/pedido-detalle-sabor.entity';
import { PedidoDetalleSaborController } from './pedido-detalle-sabor.controller';
import { PedidoDetalleSaborService } from './services/pedido-detalle-sabor.service';
import { PedidoDetalleSaborRepository } from './repositories/pedido-detalle-sabor.repository';
import { DetallePedidoModule } from '../detalle-pedido/detalle-pedido.module';
import { SaborModule } from '../sabor/sabor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PedidoDetalleSabor]),
    DetallePedidoModule,
    SaborModule,
  ],
  controllers: [PedidoDetalleSaborController],
  providers: [PedidoDetalleSaborService, PedidoDetalleSaborRepository],
  exports: [PedidoDetalleSaborService, PedidoDetalleSaborRepository],
})
export class PedidoDetalleSaborModule {}
