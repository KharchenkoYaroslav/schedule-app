import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TeacherInfo } from '../type/teacher-info.type';

export class SearchTeacherResponse {
  @ApiProperty({ description: 'List of teachers found', type: [TeacherInfo] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeacherInfo)
  teachers: TeacherInfo[];
}
