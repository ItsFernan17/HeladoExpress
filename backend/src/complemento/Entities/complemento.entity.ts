import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('complemento')
export class Complemento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bit', width: 1 })
  estado: boolean;

  @Column({ length: 50 })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio: number;

  @ManyToOne('Usuario', { nullable: true })
  @JoinColumn({ name: 'usuario_ingreso' })
  usuario_ingreso: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true})
  fecha_ingreso: Date;

  @ManyToOne('Usuario', { nullable: true })
  @JoinColumn({ name: 'usuario_modifica' })
  usuario_modifica: any;

  @Column({ type: 'timestamp', default: null, nullable: true})
  fecha_modifica: Date;    
}