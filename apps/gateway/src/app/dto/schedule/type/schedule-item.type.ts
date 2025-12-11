import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { WeekNumber } from './WeekNumber.enum';
import { DayNumber } from './DayNumber.enum';
import { PairNumber } from './PairNumber.enum';
import { LessonType } from './LessonType.enum';
import { VisitFormat } from './VisitFormat.enum';
import { PublicGroup } from './public-group.type';
import { PublicTeacher } from './public-teacher.type';

export class ScheduleItem {
  @ApiProperty({ description: 'Week number', enum: WeekNumber, example: WeekNumber.FIRST })
  @IsEnum(WeekNumber)
  weekNumber: WeekNumber;

  @ApiProperty({ description: 'Day number', enum: DayNumber, example: DayNumber.MONDAY })
  @IsEnum(DayNumber)
  dayNumber: DayNumber;

  @ApiProperty({ description: 'Pair number', enum: PairNumber, example: PairNumber.FIRST })
  @IsEnum(PairNumber)
  pairNumber: PairNumber;

  @ApiProperty({ description: 'Subject name', example: 'Mathematics' })
  @IsString()
  subjectName: string;

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

  @ApiProperty({ description: 'List of groups', type: [PublicGroup] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicGroup)
  groupsList: PublicGroup[];

  @ApiProperty({ description: 'List of teachers', type: [PublicTeacher] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicTeacher)
  teachersList: PublicTeacher[];
}
