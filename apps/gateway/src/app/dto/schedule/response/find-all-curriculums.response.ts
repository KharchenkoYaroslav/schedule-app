import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CurriculumDto } from '../type/curriculum.dto';

export class FindAllCurriculumsResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CurriculumDto)
  curriculums: CurriculumDto[];
}
