import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TeacherDto } from '../type/teacher.dto';

export class FindAllTeachersResponse {
  @ApiProperty({ description: 'List of all teachers', type: [TeacherDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeacherDto)
  teachers: TeacherDto[];
}
