import { IsString, IsEnum } from 'class-validator';
import { TeacherPost } from './TeacherPost.enum';

export class PublicTeacher {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsEnum(TeacherPost)
  post: TeacherPost;
}
