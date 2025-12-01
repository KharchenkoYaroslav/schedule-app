import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WeekNumber } from './WeekNumber.enum';
import { DayNumber } from './DayNumber.enum';
import { PairNumber } from './PairNumber.enum';
import { LessonType } from './LessonType.enum';
import { VisitFormat } from './VisitFormat.enum';
import { PublicGroup } from './public-group.type';
import { PublicTeacher } from './public-teacher.type';

export class ScheduleItem {
  @IsEnum(WeekNumber)
  weekNumber: WeekNumber;

  @IsEnum(DayNumber)
  dayNumber: DayNumber;

  @IsEnum(PairNumber)
  pairNumber: PairNumber;

  @IsString()
  subjectName: string;

  @IsEnum(LessonType)
  lessonType: LessonType;

  @IsEnum(VisitFormat)
  visitFormat: VisitFormat;

  @IsOptional()
  @IsString()
  audience?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicGroup)
  groupsList: PublicGroup[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicTeacher)
  teachersList: PublicTeacher[];
}
