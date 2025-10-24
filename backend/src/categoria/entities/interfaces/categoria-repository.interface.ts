import { Categoria } from '../categoria.entity';

export interface ICategoriaRepository {
  create(categoria: Partial<Categoria>): Categoria;
  save(categoria: Categoria): Promise<Categoria>;
  find(options?: any): Promise<Categoria[]>;
  findOne(options: any): Promise<Categoria | null>;
  findActiveStates(): Promise<Categoria[]>;
  findActiveById(id: number): Promise<Categoria | null>;
  softDeleteById(id: number): Promise<void>;
  findByNombre(nombre: string): Promise<Categoria | null>;
  hasActiveProducts(categoriaId: number): Promise<boolean>;
}
