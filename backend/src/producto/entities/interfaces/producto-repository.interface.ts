import { Producto } from '../producto.entity';

export interface IProductoRepository {
  create(producto: Partial<Producto>): Producto;
  save(producto: Producto): Promise<Producto>;
  find(options?: any): Promise<Producto[]>;
  findOne(options: any): Promise<Producto | null>;
  findActiveStates(): Promise<Producto[]>;
  findActiveById(id: number): Promise<Producto | null>;
  softDeleteById(id: number): Promise<void>;
}
