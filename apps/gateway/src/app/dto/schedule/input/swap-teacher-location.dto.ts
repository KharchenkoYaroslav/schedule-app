import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WeekNumber } from '../type/WeekNumber.enum';
import { DayNumber } from '../type/DayNumber.enum';
import { PairNumber } from '../type/PairNumber.enum';

export class SwapTeacherLocationDto {
  @ApiProperty({ description: 'Teacher ID', example: '987fcdeb-51a2-43d1-a456-426614174000' })
  @IsString()
  teacherId: string;

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
