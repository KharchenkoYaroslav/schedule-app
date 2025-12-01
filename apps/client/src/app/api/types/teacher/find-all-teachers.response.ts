import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TeacherDto } from './teacher.dto';

export class FindAllTeachersResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeacherDto)
  teachers?: TeacherDto[];
}
