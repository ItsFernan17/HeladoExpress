import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoItemBola } from './Entities/pedido-item-bola.entity';
import { PedidoItemBolaService } from './pedido-item-bola.service';
import { PedidoItemBolaController } from './pedido-item-bola.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { SaborModule } from '../sabor/sabor.module';
import { PedidoItemModule } from '../pedido-item/pedido-item.module';

@Module({
  imports: [TypeOrmModule.forFeature([PedidoItemBola]), UsuarioModule, SaborModule, PedidoItemModule],
  controllers: [PedidoItemBolaController],
  providers: [PedidoItemBolaService],
})
export class PedidoItemBolaModule {}
