import { Sabor } from '../sabor.entity';

export interface ISaborRepository {
  create(sabor: Partial<Sabor>): Sabor;
  save(sabor: Sabor): Promise<Sabor>;
  find(options?: any): Promise<Sabor[]>;
  findOne(options: any): Promise<Sabor | null>;
  findActiveStates(): Promise<Sabor[]>;
  findActiveById(id: number): Promise<Sabor | null>;
  softDeleteById(id: number): Promise<void>;
}
