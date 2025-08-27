import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  event_type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  resource_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  session_id: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
