import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoService } from './services/pedido.service';
import { PedidoController } from './pedido.controller';
import { Pedido } from './entities/pedido.entity';
import { PedidoRepository } from './repositories/pedido.repository';
import { EstadoModule } from '../estado/estado.module';
import { DetallePedidoModule } from '../detalle-pedido/detalle-pedido.module';
import { ProductoModule } from '../producto/producto.module';
import { SaborModule } from '../sabor/sabor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido]),
    EstadoModule, // Importamos EstadoModule para usar EstadoService
    forwardRef(() => DetallePedidoModule), // Resolvemos dependencia circular
    ProductoModule, // Importamos ProductoModule para usar ProductoService
    SaborModule, // Importamos SaborModule para usar SaborService
  ],
  controllers: [PedidoController],
  providers: [PedidoService, PedidoRepository],
  exports: [PedidoService, PedidoRepository],
})
export class PedidoModule {}
