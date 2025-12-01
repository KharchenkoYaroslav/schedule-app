import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateTeacherInput } from './update-teacher.input';

export class UpdateTeacherRequest {
  @IsString()
  id?: string;

  @ValidateNested()
  @Type(() => UpdateTeacherInput)
  input?: UpdateTeacherInput;
}
