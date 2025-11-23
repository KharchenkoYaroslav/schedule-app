import { IsString, IsEnum } from 'class-validator';
import { WeekNumber } from '../type/WeekNumber.enum';
import { DayNumber } from '../type/DayNumber.enum';
import { PairNumber } from '../type/PairNumber.enum';

export class SwapGroupLocationDto {
  @IsString()
  groupId: string;

  @IsEnum(WeekNumber)
  weekNumber: WeekNumber;

  @IsEnum(DayNumber)
  dayNumber: DayNumber;

  @IsEnum(PairNumber)
  pairNumber: PairNumber;
}
