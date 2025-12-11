import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SemesterNumber } from '../type/SemesterNumber.enum';
import { WeekNumber } from '../type/WeekNumber.enum';
import { DayNumber } from '../type/DayNumber.enum';
import { PairNumber } from '../type/PairNumber.enum';
import { LessonType } from '../type/LessonType.enum';
import { VisitFormat } from '../type/VisitFormat.enum';

export class AddPairDto {
  @ApiProperty({ description: 'Semester number', enum: SemesterNumber, example: SemesterNumber.FIRST })
  @IsEnum(SemesterNumber)
  semesterNumber: SemesterNumber;

  @ApiProperty({ description: 'List of group IDs', example: ['123e4567-e89b-12d3-a456-426614174000'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  groupsList: string[];

  @ApiProperty({ description: 'List of teacher IDs', example: ['987fcdeb-51a2-43d1-a456-426614174000'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  teachersList: string[];

  @ApiProperty({ description: 'Subject ID (Curriculum ID)', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsString()
  subjectId: string;

  @ApiProperty({ description: 'Week number', enum: WeekNumber, example: WeekNumber.FIRST })
  @IsEnum(WeekNumber)
  weekNumber: WeekNumber;

  @ApiProperty({ description: 'Day number', enum: DayNumber, example: DayNumber.MONDAY })
  @IsEnum(DayNumber)
  dayNumber: DayNumber;

  @ApiProperty({ description: 'Pair number', enum: PairNumber, example: PairNumber.FIRST })
  @IsEnum(PairNumber)
  pairNumber: PairNumber;

  @ApiProperty({ description: 'Type of the lesson', enum: LessonType, example: LessonType.LECTURE })
  @IsEnum(LessonType)
  lessonType: LessonType;

  @ApiProperty({ description: 'Format of the visit', enum: VisitFormat, example: VisitFormat.OFFLINE })
  @IsEnum(VisitFormat)
  visitFormat: VisitFormat;

  @ApiProperty({ description: 'Audience/Classroom', example: '101A', required: false })
  @IsOptional()
  @IsString()
  audience?: string;
}
