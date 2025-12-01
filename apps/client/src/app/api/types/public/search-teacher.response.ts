import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TeacherInfo } from './teacher-info.type';

export class SearchTeacherResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeacherInfo)
  teachers?: TeacherInfo[];
}
