import { CreateCategoriaDto } from '../../dto/create-categoria.dto';
import { UpdateCategoriaDto } from '../../dto/update-categoria.dto';
import { Categoria } from '../categoria.entity';

export interface ICategoriaService {
  create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria>;
  findAll(): Promise<Categoria[]>;
  findOne(id: number): Promise<Categoria>;
  update(id: number, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria>;
  remove(id: number): Promise<void>;
}
