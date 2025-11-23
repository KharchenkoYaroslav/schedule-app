import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleGroup } from '../type/schedule-group.type';
import { ScheduleTeacher } from '../type/schedule-teacher.type';
import { LessonType } from '../type/LessonType.enum';
import { VisitFormat } from '../type/VisitFormat.enum';

export class GetPairInfoResponse {
  @IsString()
  id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleGroup)
  groupsList: ScheduleGroup[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleTeacher)
  teachersList: ScheduleTeacher[];

  @IsEnum(LessonType)
  lessonType: LessonType;

  @IsEnum(VisitFormat)
  visitFormat: VisitFormat;

  @IsOptional()
  @IsString()
  audience?: string;
}
