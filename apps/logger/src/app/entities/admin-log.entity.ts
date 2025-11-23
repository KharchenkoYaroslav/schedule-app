import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin-logs')
export class AdminLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'admin_id'})
  adminId!: string;

  @Column('text')
  details!: string;

  @CreateDateColumn({name: 'created_at'})
  createdAt!: Date;
}
