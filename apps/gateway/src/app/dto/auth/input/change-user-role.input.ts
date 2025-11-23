import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '../types/user-role.enum';

export class ChangeUserRoleInput {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  newRole!: UserRole;
}
