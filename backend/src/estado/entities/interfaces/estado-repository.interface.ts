import { Estado } from '../estado.entity';

export interface IEstadoRepository {
  create(estado: Partial<Estado>): Estado;
  save(estado: Estado): Promise<Estado>;
  find(options?: any): Promise<Estado[]>;
  findOne(options: any): Promise<Estado | null>;
  findActiveStates(): Promise<Estado[]>;
  findActiveById(id: number): Promise<Estado | null>;
  softDeleteById(id: number): Promise<void>;
  findByNombre(nombre: string): Promise<Estado | null>;
}
