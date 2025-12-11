import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AddLogDto {
  @ApiProperty({
    description: 'ID of the admin who performed the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  adminId!: string;

  @ApiProperty({
    description: 'Log details (message)',
    example: 'User updated the schedule',
  })
  @IsString()
  details!: string;
}
