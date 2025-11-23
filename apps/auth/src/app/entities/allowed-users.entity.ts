import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './user-role.enum';

@Entity('allowed-users')
export class AllowedUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  login!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;
}

