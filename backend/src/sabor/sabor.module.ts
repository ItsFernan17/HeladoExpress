import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaborService } from './services/sabor.service';
import { SaborController } from './sabor.controller';
import { Sabor } from './entities/sabor.entity';
import { SaborRepository } from './repositories/sabor.repository';
import { SaborSeeder } from './seeds/sabor.seed';

@Module({
  imports: [TypeOrmModule.forFeature([Sabor])],
  controllers: [SaborController],
  providers: [SaborService, SaborRepository, SaborSeeder],
  exports: [SaborService, SaborRepository, SaborSeeder],
})
export class SaborModule {}
