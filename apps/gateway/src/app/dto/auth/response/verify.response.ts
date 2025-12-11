import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../types/user-role.enum';

export class VerifyResponse {
  @ApiProperty({ description: 'Indicates if the token is valid', example: true })
  valid!: boolean;

  @ApiProperty({ description: 'Unique identifier of the user', example: '123e4567-e89b-12d3-a456-426614174000' })
  userId!: string;

  @ApiProperty({ description: 'User role', enum: UserRole, example: UserRole.ADMIN })
  role!: UserRole;
}
