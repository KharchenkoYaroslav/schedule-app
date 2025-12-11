import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TeacherPost } from '../type/TeacherPost.enum';

export class CreateTeacherInput {
  @ApiProperty({ description: 'Full name of the teacher', example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Department name', example: 'IPZE' })
  @IsString()
  department: string;

  @ApiProperty({ description: 'Position of the teacher', enum: TeacherPost, example: TeacherPost.DOCENT })
  @IsEnum(TeacherPost)
  post: TeacherPost;
}
