import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, UpdateDateColumn } from 'typeorm';
import { IPedido } from './interfaces/pedido.interface';
import { Estado } from '../../estado/entities/estado.entity';
import { DetallePedido } from '../../detalle-pedido/entities/detalle-pedido.entity';

@Entity('pedido')
export class Pedido implements IPedido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Estado, { eager: true })
  @JoinColumn({ name: 'estado_id' })
  estado_id: Estado;

  @Column({ type: 'varchar', length: 5, unique: true })
  numero: string;

  @Column({ type: 'boolean', default: true })
  esta_activo: boolean;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => DetallePedido, detalle => detalle.pedido_id)
  detalles: DetallePedido[];
}
