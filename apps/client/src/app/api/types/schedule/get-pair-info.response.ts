import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleGroup } from './schedule-group.type';
import { ScheduleTeacher } from './schedule-teacher.type';
import { LessonType } from '../enums/LessonType.enum';
import { VisitFormat } from '../enums/VisitFormat.enum';

export class GetPairInfoResponse {
  @IsString()
  id?: string;

  @IsString()
  subjectId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleGroup)
  groupsList?: ScheduleGroup[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleTeacher)
  teachersList?: ScheduleTeacher[];

  @IsEnum(LessonType)
  lessonType?: LessonType;

  @IsEnum(VisitFormat)
  visitFormat?: VisitFormat;

  @IsOptional()
  @IsString()
  audience?: string;
}
