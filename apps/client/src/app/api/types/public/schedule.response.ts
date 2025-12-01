import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleItem } from './schedule-item.type';

export class ScheduleResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItem)
  schedule?: ScheduleItem[];

  @IsString()
  identifier?: string;
}
