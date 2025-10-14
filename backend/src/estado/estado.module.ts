import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoService } from './services/estado.service';
import { EstadoController } from './estado.controller';
import { Estado } from './entities/estado.entity';
import { EstadoRepository } from './repositories/estado.repository';
import { EstadoSeeder } from './seeds/estado.seed';

@Module({
  imports: [TypeOrmModule.forFeature([Estado])],
  controllers: [EstadoController],
  providers: [EstadoService, EstadoRepository, EstadoSeeder],
  exports: [EstadoService, EstadoRepository, EstadoSeeder],
})
export class EstadoModule {}
