import { IsString, IsEnum } from 'class-validator';
import { TeacherPost } from './TeacherPost.enum';

export class TeacherDto {
  @IsString()
  id: string;

  @IsString()
  fullName: string;

  @IsString()
  department: string;

  @IsEnum(TeacherPost)
  post: TeacherPost;
}
