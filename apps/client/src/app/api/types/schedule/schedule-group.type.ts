import { IsString } from 'class-validator';

export class ScheduleGroup {
  @IsString()
  id?: string;

  @IsString()
  groupCode?: string;
}
