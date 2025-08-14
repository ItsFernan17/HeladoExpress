import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SaborModule } from './sabor/sabor.module';
import { UsuarioModule } from './usuario/usuario.module';
import { ComplementoModule } from './complemento/complemento.module';
import { TipoHeladoModule } from './tipo-helado/tipo-helado.module';
import { PedidoModule } from './pedido/pedido.module';
import { PedidoItemModule } from './pedido-item/pedido-item.module';
import { PedidoItemComplementoModule } from './pedido-item-complemento/pedido-item-complemento.module';
import { PedidoItemBolaModule } from './pedido-item-bola/pedido-item-bola.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({ 
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      dropSchema: false, 
    }),
    SaborModule,
    UsuarioModule,
    ComplementoModule,
    TipoHeladoModule,
    PedidoModule,
    PedidoItemModule,
    PedidoItemComplementoModule,
    PedidoItemBolaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
