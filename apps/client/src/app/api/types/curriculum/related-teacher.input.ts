import { IsNumber, IsString } from 'class-validator';

export class RelatedTeacherInput {
  @IsString()
  id?: string;

  @IsNumber()
  plannedLectures?: number;

  @IsNumber()
  plannedPracticals?: number;

  @IsNumber()
  plannedLabs?: number;
}
