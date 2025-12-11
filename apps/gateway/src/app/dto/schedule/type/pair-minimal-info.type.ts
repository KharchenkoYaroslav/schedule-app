import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SemesterNumber } from './SemesterNumber.enum';
import { WeekNumber } from './WeekNumber.enum';
import { DayNumber } from './DayNumber.enum';
import { PairNumber } from './PairNumber.enum';

export class PairMinimalInfo {
  @ApiProperty({ description: 'Unique identifier of the pair', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Name of the subject', example: 'Physics' })
  @IsString()
  subjectName: string;

  @ApiProperty({ description: 'Semester number', enum: SemesterNumber, example: SemesterNumber.FIRST })
  @IsEnum(SemesterNumber)
  semesterNumber: SemesterNumber;

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
