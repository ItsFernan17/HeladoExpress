import { CreateProductoDto } from '../../dto/create-producto.dto';
import { UpdateProductoDto } from '../../dto/update-producto.dto';
import { Producto } from '../producto.entity';

export interface IProductoService {
  create(createProductoDto: CreateProductoDto): Promise<Producto>;
  findAll(): Promise<Producto[]>;
  findOne(id: number): Promise<Producto>;
  update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto>;
  remove(id: number): Promise<void>;
  findByNombre(nombre: string): Promise<Producto | null>;
  findByCategoria(categoriaId: number): Promise<Producto[]>;
}
