import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeLoginInput {
  @ApiProperty({ description: 'New login for the user', example: 'updatedUser123' })
  @IsString()
  @IsNotEmpty()
  newLogin!: string;
}
