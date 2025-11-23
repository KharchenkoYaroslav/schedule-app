import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { SemesterNumber } from './SemesterNumber.enum';
import { WeekNumber } from './WeekNumber.enum';
import { DayNumber } from './DayNumber.enum';
import { PairNumber } from './PairNumber.enum';
import { VisitFormat } from './VisitFormat.enum';
import { LessonType } from './LessonType.enum';

export class ScheduleDto {
  @IsString()
  id: string;

  @IsArray()
  @IsString({ each: true })
  teachersList: string[];

  @IsArray()
  @IsString({ each: true })
  groupsList: string[];

  @IsString()
  subjectId: string;

  @IsEnum(SemesterNumber)
  semesterNumber: SemesterNumber;

  @IsEnum(WeekNumber)
  weekNumber: WeekNumber;

  @IsEnum(DayNumber)
  dayNumber: DayNumber;

  @IsEnum(PairNumber)
  pairNumber: PairNumber;

  @IsEnum(VisitFormat)
  visitFormat: VisitFormat;

  @IsEnum(LessonType)
  lessonType: LessonType;

  @IsOptional()
  @IsString()
  audience: string;
}
