import { IsNumber, IsString } from 'class-validator';

export class RelatedTeacher {
  @IsString()
  id?: string;

  @IsString()
  name?: string;

  @IsNumber()
  plannedLectures?: number;

  @IsNumber()
  plannedPracticals?: number;

  @IsNumber()
  plannedLabs?: number;

  @IsNumber()
  scheduledLectures?: number;

  @IsNumber()
  scheduledPracticals?: number;

  @IsNumber()
  scheduledLabs?: number;
}
