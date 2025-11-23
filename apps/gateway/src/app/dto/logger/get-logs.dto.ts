import { IsUUID, IsNumber, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetLogsDto {
  @IsOptional()
  @IsUUID()
  adminId?: string;

  @Type(() => Number)
  @IsNumber()
  count!: number;

  @IsIn(['last', 'first'])
  @IsOptional()
  order?: 'last' | 'first' = 'last';
}
