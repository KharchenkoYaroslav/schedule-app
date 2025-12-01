import { IsString, IsEnum } from 'class-validator';
import { WeekNumber } from '../enums/WeekNumber.enum';
import { DayNumber } from '../enums/DayNumber.enum';
import { PairNumber } from '../enums/PairNumber.enum';

export class TeacherLocationDto {
  @IsString()
  teacherId?: string;

  @IsEnum(WeekNumber)
  weekNumber?: WeekNumber;

  @IsEnum(DayNumber)
  dayNumber?: DayNumber;

  @IsEnum(PairNumber)
  pairNumber?: PairNumber;
}
