import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WeekNumber } from '../type/WeekNumber.enum';
import { DayNumber } from '../type/DayNumber.enum';
import { PairNumber } from '../type/PairNumber.enum';

export class SwapGroupLocationDto {
  @ApiProperty({ description: 'Group ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  groupId: string;

  @ApiProperty({ description: 'Week number', enum: WeekNumber, example: WeekNumber.FIRST })
  @IsEnum(WeekNumber)
  weekNumber: WeekNumber;

  @ApiProperty({ description: 'Day number', enum: DayNumber, example: DayNumber.MONDAY })
  @IsEnum(DayNumber)
  dayNumber: DayNumber;

  @ApiProperty({ description: 'Pair number', enum: PairNumber, example: PairNumber.FIRST })
  @IsEnum(PairNumber)
  pairNumber: PairNumber;
}
