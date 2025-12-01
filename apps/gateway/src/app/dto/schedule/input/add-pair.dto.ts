import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { SemesterNumber } from '../type/SemesterNumber.enum';
import { WeekNumber } from '../type/WeekNumber.enum';
import { DayNumber } from '../type/DayNumber.enum';
import { PairNumber } from '../type/PairNumber.enum';
import { LessonType } from '../type/LessonType.enum';
import { VisitFormat } from '../type/VisitFormat.enum';

export class AddPairDto {
  @IsEnum(SemesterNumber)
  semesterNumber: SemesterNumber;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  groupsList: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  teachersList: string[];

  @IsString()
  subjectId: string;

  @IsEnum(WeekNumber)
  weekNumber: WeekNumber;

  @IsEnum(DayNumber)
  dayNumber: DayNumber;

  @IsEnum(PairNumber)
  pairNumber: PairNumber;

  @IsEnum(LessonType)
  lessonType: LessonType;

  @IsEnum(VisitFormat)
  visitFormat: VisitFormat;

  @IsOptional()
  @IsString()
  audience?: string;
}
