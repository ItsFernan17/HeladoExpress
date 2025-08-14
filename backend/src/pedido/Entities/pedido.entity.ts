import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('pedido')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bit', width: 1, default: true })
  estado: boolean;

  @Column({ length: 50, unique: true })
  codigo: string;

  @Column({ length: 50 })
  estado_pedido: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @ManyToOne('Usuario', { nullable: true })
  @JoinColumn({ name: 'usuario_ingreso' })
  usuario_ingreso: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  fecha_ingreso: Date;

  @ManyToOne('Usuario', { nullable: true })
  @JoinColumn({ name: 'usuario_modifica' })
  usuario_modifica: any;

  @Column({ type: 'timestamp', default: null, nullable: true })
  fecha_modifica: Date;
}
