import { CreateSaborDto } from '../../dto/create-sabor.dto';
import { UpdateSaborDto } from '../../dto/update-sabor.dto';
import { Sabor } from '../sabor.entity';

export interface ISaborService {
  create(createSaborDto: CreateSaborDto): Promise<Sabor>;
  findAll(): Promise<Sabor[]>;
  findOne(id: number): Promise<Sabor>;
  update(id: number, updateSaborDto: UpdateSaborDto): Promise<Sabor>;
  remove(id: number): Promise<void>;
}
