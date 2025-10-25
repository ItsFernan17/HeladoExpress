import { Producto } from '../producto.entity';

export interface IProductoRepository {
  create(producto: Partial<Producto>): Producto;
  save(producto: Producto): Promise<Producto>;
  find(options?: any): Promise<Producto[]>;
  findOne(options: any): Promise<Producto | null>;
  findActiveStates(): Promise<Producto[]>;
  findActiveById(id: number): Promise<Producto | null>;
  softDeleteById(id: number): Promise<void>;
  findByNombre(nombre: string): Promise<Producto | null>;
  findByNombreAndCategoria(nombre: string, categoriaId: number): Promise<Producto | null>;
  findByCategoria(categoriaId: number): Promise<Producto[]>;
}
