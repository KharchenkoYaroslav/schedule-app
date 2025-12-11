import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordInput {
  @ApiProperty({ description: 'Current password', example: 'oldPassword123' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ description: 'New password', example: 'newSecurePassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'New password must be at least 5 characters long' })
  newPassword!: string;
}
