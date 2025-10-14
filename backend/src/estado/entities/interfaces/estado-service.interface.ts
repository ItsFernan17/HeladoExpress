import { CreateEstadoDto } from '../../dto/create-estado.dto';
import { UpdateEstadoDto } from '../../dto/update-estado.dto';
import { Estado } from '../estado.entity';

export interface IEstadoService {
  create(createEstadoDto: CreateEstadoDto): Promise<Estado>;
  findAll(): Promise<Estado[]>;
  findOne(id: number): Promise<Estado>;
  update(id: number, updateEstadoDto: UpdateEstadoDto): Promise<Estado>;
  remove(id: number): Promise<void>;
}
