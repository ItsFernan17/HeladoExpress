import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoItemComplemento } from './Entities/pedido-item-complemento.entity';
import { PedidoItemComplementoService } from './pedido-item-complemento.service';
import { PedidoItemComplementoController } from './pedido-item-complemento.controller';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([PedidoItemComplemento]), UsuarioModule],
  controllers: [PedidoItemComplementoController],
  providers: [PedidoItemComplementoService],
})
export class PedidoItemComplementoModule {}
