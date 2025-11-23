import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '../types/user-role.enum';

export class AddAllowedUserInput {
  @IsString()
  @IsNotEmpty()
  login!: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}
