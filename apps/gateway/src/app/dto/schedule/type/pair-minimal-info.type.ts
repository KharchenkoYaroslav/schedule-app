import { IsString, IsEnum } from 'class-validator';
import { SemesterNumber } from './SemesterNumber.enum';
import { WeekNumber } from './WeekNumber.enum';
import { DayNumber } from './DayNumber.enum';
import { PairNumber } from './PairNumber.enum';

export class PairMinimalInfo {
  @IsString()
  id: string;

  @IsString()
  subjectName: string;

  @IsEnum(SemesterNumber)
  semesterNumber: SemesterNumber;

  @IsEnum(WeekNumber)
  weekNumber: WeekNumber;

  @IsEnum(DayNumber)
  dayNumber: DayNumber;

  @IsEnum(PairNumber)
  pairNumber: PairNumber;
}
