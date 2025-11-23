import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleItem } from '../type/schedule-item.type';

export class ScheduleResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItem)
  schedule: ScheduleItem[];
}
