import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ScheduleGroup } from '../type/schedule-group.type';
import { ScheduleTeacher } from '../type/schedule-teacher.type';
import { LessonType } from '../type/LessonType.enum';
import { VisitFormat } from '../type/VisitFormat.enum';

export class GetPairInfoResponse {
  @ApiProperty({ description: 'Unique identifier of the pair', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Subject ID', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsString()
  subjectId: string;

  @ApiProperty({ description: 'List of groups attending this pair', type: [ScheduleGroup] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleGroup)
  groupsList: ScheduleGroup[];

  @ApiProperty({ description: 'List of teachers conducting this pair', type: [ScheduleTeacher] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleTeacher)
  teachersList: ScheduleTeacher[];

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
