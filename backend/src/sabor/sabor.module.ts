import { Module } from '@nestjs/common';
import { SaborService } from './sabor.service';
import { SaborController } from './sabor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sabor } from './Entities/sabor.entity';
import { UsuarioModule } from '../usuario/usuario.module';


@Module({
  imports: [TypeOrmModule.forFeature([Sabor]), UsuarioModule],
  controllers: [SaborController],
  providers: [SaborService],
  exports: [SaborService],
})
export class SaborModule {}
