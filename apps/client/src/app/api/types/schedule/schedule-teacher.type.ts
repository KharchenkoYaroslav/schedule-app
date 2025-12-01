import { IsString } from 'class-validator';

export class ScheduleTeacher {
  @IsString()
  id?: string;

  @IsString()
  name?: string;
}
