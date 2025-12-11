import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetLogsDto {
  @ApiProperty({
    description: 'Filter by admin ID (optional)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  adminId?: string;

  @ApiProperty({
    description: 'Number of logs to retrieve',
    example: 10,
  })
  @Type(() => Number)
  @IsNumber()
  count!: number;

  @ApiProperty({
    description: 'Sort order',
    enum: ['last', 'first'],
    default: 'last',
    required: false,
  })
  @IsIn(['last', 'first'])
  @IsOptional()
  order?: 'last' | 'first' = 'last';
}
