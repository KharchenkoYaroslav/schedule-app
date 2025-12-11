import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CurriculumDto } from '../type/curriculum.dto';

export class FindAllCurriculumsResponse {
  @ApiProperty({ description: 'List of all curriculums', type: [CurriculumDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CurriculumDto)
  curriculums: CurriculumDto[];
}
