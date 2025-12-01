import { IsNumber, IsString } from 'class-validator';

export class RelatedGroup {
  @IsString()
  id?: string;

  @IsString()
  code?: string;

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
