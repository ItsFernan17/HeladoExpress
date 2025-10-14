import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ICategoria } from './interfaces/categoria.interface';

@Entity('categoria')
export class Categoria implements ICategoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 45 })
  nombre: string;

  @Column({ type: 'boolean', default: true })
  esta_activo: boolean;
}
