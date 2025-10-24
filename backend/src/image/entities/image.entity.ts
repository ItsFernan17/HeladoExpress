import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 500 })
  path: string;

  @Column({ type: 'enum', enum: ['categoria', 'producto'] })
  entity_type: 'categoria' | 'producto';

  @Column({ type: 'int' })
  entity_id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mime_type: string;

  @Column({ type: 'int', nullable: true })
  size: number;

  @Column({ type: 'boolean', default: true })
  esta_activo: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}