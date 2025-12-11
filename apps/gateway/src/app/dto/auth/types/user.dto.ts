import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './user-role.enum';

export class UserDto {
  @ApiProperty({ description: 'Unique identifier of the user', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: 'User login', example: 'user123' })
  login!: string;

  @ApiProperty({ description: 'User role', enum: UserRole, example: UserRole.ADMIN })
  role!: UserRole;
}
