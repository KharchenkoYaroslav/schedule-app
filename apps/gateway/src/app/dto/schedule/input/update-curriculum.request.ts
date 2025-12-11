import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CurriculumInput } from './curriculum.input';

export class UpdateCurriculumRequest {
  @ApiProperty({ description: 'Unique identifier of the curriculum', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Updated curriculum data', type: CurriculumInput })
  @ValidateNested()
  @Type(() => CurriculumInput)
  input: CurriculumInput;
}
