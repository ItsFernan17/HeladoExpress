import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoItem } from './Entities/pedido-item.entity';
import { PedidoItemService } from './pedido-item.service';
import { PedidoItemController } from './pedido-item.controller';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([PedidoItem]), UsuarioModule],
  controllers: [PedidoItemController],
  providers: [PedidoItemService],
  exports: [PedidoItemService],
})
export class PedidoItemModule {}
