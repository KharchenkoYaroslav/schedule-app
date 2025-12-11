import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterInput {
  @ApiProperty({ description: 'Desired user login', example: 'newUser123' })
  @IsString()
  @IsNotEmpty()
  login!: string;

  @ApiProperty({ description: 'User password', example: 'securePassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Password must be at least 5 characters long' })
  password!: string;
}
