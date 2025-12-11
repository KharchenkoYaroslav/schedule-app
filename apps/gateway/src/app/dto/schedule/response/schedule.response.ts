import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ScheduleItem } from '../type/schedule-item.type';

export class ScheduleResponse {
  @ApiProperty({ description: 'List of schedule items', type: [ScheduleItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItem)
  schedule: ScheduleItem[];

  @ApiProperty({ description: 'Identifier for the schedule owner (Group ID or Teacher ID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  identifier: string;
}
