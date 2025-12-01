import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WeekNumber } from '../enums/WeekNumber.enum';
import { DayNumber } from '../enums//DayNumber.enum';
import { PairNumber } from '../enums//PairNumber.enum';
import { LessonType } from '../enums//LessonType.enum';
import { VisitFormat } from '../enums//VisitFormat.enum';
import { PublicGroup } from './public-group.type';
import { PublicTeacher } from './public-teacher.type';

export class ScheduleItem {
  @IsEnum(WeekNumber)
  weekNumber?: WeekNumber;

  @IsEnum(DayNumber)
  dayNumber?: DayNumber;

  @IsEnum(PairNumber)
  pairNumber?: PairNumber;

  @IsString()
  subjectName?: string;

  @IsEnum(LessonType)
  lessonType?: LessonType;

  @IsEnum(VisitFormat)
  visitFormat?: VisitFormat;

  @IsOptional()
  @IsString()
  audience?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicGroup)
  groupsList?: PublicGroup[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicTeacher)
  teachersList?: PublicTeacher[];
}
