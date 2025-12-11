import { IsString, IsUUID, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogDto {
  @ApiProperty({
    description: 'Unique identifier of the log entry',
    example: '987fcdeb-51a2-43d1-a456-426614174000',
  })
  @IsUUID()
  id!: string;

  @ApiProperty({
    description: 'Unique identifier of the admin who performed the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  adminId!: string;

  @ApiProperty({
    description: 'Details of the logged action',
    example: 'Updated teacher profile',
  })
  @IsString()
  details!: string;

  @ApiProperty({
    description: 'Timestamp when the log was created',
    example: '2023-10-27T10:00:00.000Z',
  })
  @IsDate()
  createdAt!: Date;
}
