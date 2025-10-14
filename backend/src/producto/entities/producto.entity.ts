import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IProducto } from './interfaces/producto.interface';
import { Categoria } from '../../categoria/entities/categoria.entity';

@Entity('producto')
export class Producto implements IProducto {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Categoria, { eager: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria_id: Categoria;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_base: number;

  @Column({ type: 'boolean', default: true })
  esta_activo: boolean;
}
