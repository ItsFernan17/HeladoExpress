import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('pedido_item_complemento')
export class PedidoItemComplemento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bit', width: 1, default: true })
  estado: boolean;

  @ManyToOne('PedidoItem', { nullable: false })
  @JoinColumn({ name: 'pedido_item_id' })
  pedido_item_id: any;

  @ManyToOne('Complemento', { nullable: false })
  @JoinColumn({ name: 'complemento_id' })
  complemento_id: any;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_unitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

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
