import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplementoService } from './complemento.service';
import { ComplementoController } from './complemento.controller';
import { Complemento } from './Entities/complemento.entity';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([Complemento]), UsuarioModule],
  controllers: [ComplementoController],
  providers: [ComplementoService],
})
export class ComplementoModule {}
