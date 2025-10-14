import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ISabor } from './interfaces/sabor.interface';

@Entity('sabor')
export class Sabor implements ISabor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({ type: 'boolean', default: true })
  esta_activo: boolean;
}
