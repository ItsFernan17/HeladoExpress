import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { DetallePedidoController } from './detalle-pedido.controller';
import { DetallePedidoService } from './services/detalle-pedido.service';
import { DetallePedidoRepository } from './repositories/detalle-pedido.repository';
import { PedidoModule } from '../pedido/pedido.module';
import { ProductoModule } from '../producto/producto.module';
import { SaborModule } from '../sabor/sabor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetallePedido]),
    forwardRef(() => PedidoModule), // Resolvemos dependencia circular
    ProductoModule,
    SaborModule, // Agregamos SaborModule
  ],
  controllers: [DetallePedidoController],
  providers: [DetallePedidoService, DetallePedidoRepository],
  exports: [DetallePedidoService, DetallePedidoRepository],
})
export class DetallePedidoModule {}
