import { IsOptional, IsString, IsEnum } from 'class-validator';
import { TeacherPost } from '../enums/TeacherPost.enum';

export class UpdateTeacherInput {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsEnum(TeacherPost)
  post?: TeacherPost;
}
