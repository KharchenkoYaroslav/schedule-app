import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RelatedTeacherInput } from './related-teacher.input';
import { RelatedGroupInput } from './related-group.input';

export class CurriculumInput {
  @ApiProperty({ description: 'Name of the subject', example: 'Mathematics' })
  @IsString()
  subjectName: string;

  @ApiProperty({ description: 'List of related teachers', type: [RelatedTeacherInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelatedTeacherInput)
  relatedTeachers: RelatedTeacherInput[];

  @ApiProperty({ description: 'List of related groups', type: [RelatedGroupInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelatedGroupInput)
  relatedGroups: RelatedGroupInput[];
}
