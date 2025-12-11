import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddLogDto {
  @ApiProperty({
    description: 'Unique identifier of the admin performing the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  adminId!: string;

  @ApiProperty({
    description: 'Details describing the action performed',
    example: 'Created a new group',
  })
  @IsString()
  details!: string;
}
