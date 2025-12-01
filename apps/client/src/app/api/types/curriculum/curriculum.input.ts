import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RelatedTeacherInput } from './related-teacher.input';
import { RelatedGroupInput } from './related-group.input';

export class CurriculumInput {
  @IsString()
  subjectName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelatedTeacherInput)
  relatedTeachers?: RelatedTeacherInput[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelatedGroupInput)
  relatedGroups?: RelatedGroupInput[];
}
