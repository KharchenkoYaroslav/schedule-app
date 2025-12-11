import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteAllowedUserInput {
  @ApiProperty({ description: 'Unique identifier of the allowed user entry', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  userId!: string;
}
