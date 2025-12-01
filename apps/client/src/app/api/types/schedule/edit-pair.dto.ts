import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { SemesterNumber } from '../enums/SemesterNumber.enum';
import { WeekNumber } from '../enums/WeekNumber.enum';
import { DayNumber } from '../enums/DayNumber.enum';
import { PairNumber } from '../enums/PairNumber.enum';
import { LessonType } from '../enums/LessonType.enum';
import { VisitFormat } from '../enums/VisitFormat.enum';

export class EditPairDto {
  @IsString()
  id?: string;

  @IsEnum(SemesterNumber)
  semesterNumber?: SemesterNumber;

  @IsArray()
  @IsString({ each: true })
  groupsList?: string[];

  @IsArray()
  @IsString({ each: true })
  teachersList?: string[];

  @IsString()
  subjectId?: string;

  @IsEnum(WeekNumber)
  weekNumber?: WeekNumber;

  @IsEnum(DayNumber)
  dayNumber?: DayNumber;

  @IsEnum(PairNumber)
  pairNumber?: PairNumber;

  @IsEnum(LessonType)
  lessonType?: LessonType;

  @IsEnum(VisitFormat)
  visitFormat?: VisitFormat;

  @IsOptional()
  @IsString()
  audience?: string;
}
