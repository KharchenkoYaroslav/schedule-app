import { IsString, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RelatedTeacher } from './related-teacher.type';
import { RelatedGroup } from './related-group.type';

export class CurriculumDto {
  @ApiProperty({ description: 'Unique identifier of the curriculum', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Name of the subject', example: 'Mathematics' })
  @IsString()
  subjectName: string;

  @ApiProperty({ description: 'List of related teachers', type: [RelatedTeacher] })
  @IsArray()
  relatedTeachers: RelatedTeacher[];

  @ApiProperty({ description: 'List of related groups', type: [RelatedGroup] })
  @IsArray()
  relatedGroups: RelatedGroup[];

  @ApiProperty({ description: 'Indicates if it is a correspond to pairs in schedule', example: false })
  @IsBoolean()
  correspondence: boolean;
}
