import { IsString, IsEnum } from 'class-validator';
import { TeacherPost } from '../type/TeacherPost.enum';

export class CreateTeacherInput {
  @IsString()
  fullName: string;

  @IsString()
  department: string;

  @IsEnum(TeacherPost)
  post: TeacherPost;
}
