import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoHelado } from './Entities/tipo-helado.entity';
import { TipoHeladoService } from './tipo-helado.service';
import { TipoHeladoController } from './tipo-helado.controller';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([TipoHelado]), UsuarioModule],
  controllers: [TipoHeladoController],
  providers: [TipoHeladoService],
})
export class TipoHeladoModule {}
