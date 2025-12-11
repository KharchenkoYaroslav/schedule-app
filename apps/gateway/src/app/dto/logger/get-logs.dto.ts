import { IsUUID, IsNumber, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetLogsDto {
  @ApiProperty({
    description: 'Filter logs by a specific Admin ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
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
    description: 'Sort order for the logs',
    example: 'last',
    enum: ['last', 'first'],
    default: 'last',
    required: false,
  })
  @IsIn(['last', 'first'])
  @IsOptional()
  order?: 'last' | 'first' = 'last';
}
