import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IEstado } from './interfaces/estado.interface';

@Entity('estado')
export class Estado implements IEstado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 45 })
  nombre: string;

  @Column({ type: 'boolean', default: true })
  esta_activo: boolean;
}
