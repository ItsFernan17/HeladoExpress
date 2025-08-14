import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('pedido_item_bola')
export class PedidoItemBola {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bit', width: 1, default: true })
  estado: boolean;

  @ManyToOne('PedidoItem', { nullable: false })
  @JoinColumn({ name: 'pedido_item_id' })
  pedido_item_id: any;

  @ManyToOne('Sabor', { nullable: false })
  @JoinColumn({ name: 'sabor_id' })
  sabor_id: any;

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
