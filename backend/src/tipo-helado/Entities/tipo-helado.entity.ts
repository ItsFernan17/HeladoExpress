import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('tipo_helado')
export class TipoHelado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bit', width: 1, default: true })
  estado: boolean;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'int', default: 1 })
  max_bolas: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_base: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio_bola_adicional: number;

  @Column({ type: 'bit', width: 1, default: true })
  permite_complemento: boolean;

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
