import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../types/user-role.enum';

export class LoginResponse {
  @ApiProperty({ description: 'JWT Access Token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token!: string;

  @ApiProperty({ description: 'Unique identifier of the user', example: '123e4567-e89b-12d3-a456-426614174000' })
  userId!: string;

  @ApiProperty({ description: 'User login', example: 'user123' })
  login!: string;

  @ApiProperty({ description: 'User role', enum: UserRole, example: UserRole.ADMIN })
  role!: UserRole;

  @ApiProperty({ description: 'Timestamp when the user was created', example: '2023-01-01T12:00:00Z' })
  createdAt!: string;
}
