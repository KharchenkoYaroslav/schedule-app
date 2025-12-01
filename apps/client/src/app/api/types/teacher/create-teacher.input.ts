import { IsString, IsEnum } from 'class-validator';
import { TeacherPost } from '../enums/TeacherPost.enum';

export class CreateTeacherInput {
  @IsString()
  fullName?: string;

  @IsString()
  department?: string;

  @IsEnum(TeacherPost)
  post?: TeacherPost;
}
