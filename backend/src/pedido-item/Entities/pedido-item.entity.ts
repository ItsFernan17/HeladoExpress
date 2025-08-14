import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('pedido_item')
export class PedidoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bit', width: 1, default: true })
  estado: boolean;

  @ManyToOne('Pedido', { nullable: false })
  @JoinColumn({ name: 'pedidoId' })
  pedidoId: any;

  @ManyToOne('TipoHelado', { nullable: false })
  @JoinColumn({ name: 'tipo_heladoID' })
  tipo_heladoID: any;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @Column({ type: 'int', default: 1 })
  bolas_solicitadas: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_unitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio_unitario_bola_extra: number;

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
