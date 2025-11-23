import { IsString, IsArray, IsBoolean } from 'class-validator';
import { RelatedTeacher } from './related-teacher.type';
import { RelatedGroup } from './related-group.type';

export class CurriculumDto {
  @IsString()
  id: string;

  @IsString()
  subjectName: string;

  @IsArray()
  relatedTeachers: RelatedTeacher[];

  @IsArray()
  relatedGroups: RelatedGroup[];

  @IsBoolean()
  correspondence: boolean;
}
