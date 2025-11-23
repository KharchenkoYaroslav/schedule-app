import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Curriculum } from '../../entities/Curriculum.entity';

interface PlannedHours {
  plannedLectures: number;
  plannedPracticals: number;
  plannedLabs: number;
  scheduledLectures: number;
  scheduledPracticals: number;
  scheduledLabs: number;
}

export interface RelatedTeacher extends PlannedHours {
  id: string;
}

export interface RelatedGroup extends PlannedHours {
  id: string;
}


export class RelatedTeacherDto implements RelatedTeacher {
  id: string;
  name: string;
  plannedLectures: number;
  plannedPracticals: number;
  plannedLabs: number;
  scheduledLectures: number;
  scheduledPracticals: number;
  scheduledLabs: number;
}

export class RelatedGroupDto implements RelatedGroup {
  id: string;
  code: string;
  plannedLectures: number;
  plannedPracticals: number;
  plannedLabs: number;
  scheduledLectures: number;
  scheduledPracticals: number;
  scheduledLabs: number;
}

export class CurriculumDto extends Curriculum {
  relatedTeachers: RelatedTeacherDto[];
  relatedGroups: RelatedGroupDto[];
}

class PlannedHoursInput {
  @IsNumber()
  @IsNotEmpty()
  plannedLectures: number;

  @IsNumber()
  @IsNotEmpty()
  plannedPracticals: number;

  @IsNumber()
  @IsNotEmpty()
  plannedLabs: number;
}

class RelatedTeacherInput extends PlannedHoursInput {
  @IsString()
  @IsNotEmpty()
  id: string;
}

class RelatedGroupInput extends PlannedHoursInput {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class CurriculumInput {
  @IsString()
  @IsNotEmpty()
  subjectName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelatedTeacherInput)
  relatedTeachers: RelatedTeacherInput[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelatedGroupInput)
  relatedGroups: RelatedGroupInput[];
}


export class FindAllCurriculumsResponse {
  curriculums: CurriculumDto[];
}
