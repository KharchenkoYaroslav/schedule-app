import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { UserRole } from './user-role.enum';

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  login!: string;

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @CreateDateColumn()
  created_at!: Date;
}
