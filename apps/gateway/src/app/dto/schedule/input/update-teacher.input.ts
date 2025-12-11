import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TeacherPost } from '../type/TeacherPost.enum';

export class UpdateTeacherInput {
  @ApiProperty({ description: 'New full name', example: 'Jane Doe', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ description: 'New department', example: 'IPZE', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ description: 'New position', enum: TeacherPost, example: TeacherPost.PROFESSOR, required: false })
  @IsOptional()
  @IsEnum(TeacherPost)
  post?: TeacherPost;
}
