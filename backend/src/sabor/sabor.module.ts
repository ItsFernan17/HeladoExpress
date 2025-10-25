import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaborService } from './services/sabor.service';
import { SaborController } from './sabor.controller';
import { Sabor } from './entities/sabor.entity';
import { SaborRepository } from './repositories/sabor.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Sabor])],
  controllers: [SaborController],
  providers: [SaborService, SaborRepository],
  exports: [SaborService, SaborRepository],
})
export class SaborModule {}
