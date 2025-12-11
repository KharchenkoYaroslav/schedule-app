import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TeacherPost } from './TeacherPost.enum';

export class PublicTeacher {
  @ApiProperty({ description: 'Unique identifier of the teacher', example: '987fcdeb-51a2-43d1-a456-426614174000' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Full name of the teacher', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Position of the teacher', enum: TeacherPost, example: TeacherPost.DOCENT })
  @IsEnum(TeacherPost)
  post: TeacherPost;
}
