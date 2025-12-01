import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CurriculumInput } from './curriculum.input';

export class UpdateCurriculumRequest {
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => CurriculumInput)
  input: CurriculumInput;
}
