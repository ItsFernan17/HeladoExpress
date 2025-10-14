import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { DetallePedido } from '../../detalle-pedido/entities/detalle-pedido.entity';
import { Sabor } from '../../sabor/entities/sabor.entity';

@Entity('pedido_detalle_sabor')
export class PedidoDetalleSabor {
  @PrimaryColumn()
  detalle_pedido_id: number;

  @PrimaryColumn()
  sabor_id: number;

  @ManyToOne(() => DetallePedido, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'detalle_pedido_id' })
  detalle_pedido: DetallePedido;

  @ManyToOne(() => Sabor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sabor_id' })
  sabor: Sabor;

  @Column({ type: 'boolean', default: true })
  esta_activo: boolean;
}
