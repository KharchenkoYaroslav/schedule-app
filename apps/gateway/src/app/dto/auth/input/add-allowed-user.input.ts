import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../types/user-role.enum';

export class AddAllowedUserInput {
  @ApiProperty({ description: 'Login allowed for registration', example: 'futureAdmin' })
  @IsString()
  @IsNotEmpty()
  login!: string;

  @ApiProperty({ description: 'Role to be assigned to the user', enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}
