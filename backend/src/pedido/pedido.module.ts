import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './Entities/pedido.entity';
import { PedidoService } from './pedido.service';
import { PedidoController } from './pedido.controller';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido]), UsuarioModule],
  controllers: [PedidoController],
  providers: [PedidoService],
})
export class PedidoModule {}
