import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../types/user-role.enum';

export class ChangeUserRoleInput {
  @ApiProperty({ description: 'Unique identifier of the user', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ description: 'New role for the user', enum: UserRole, example: UserRole.SUPER_ADMIN })
  @IsEnum(UserRole)
  @IsNotEmpty()
  newRole!: UserRole;
}
