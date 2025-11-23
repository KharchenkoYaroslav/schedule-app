import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { TeacherPost } from '../../types/TeacherPost.enum';
import { Teacher } from '../../entities/Teacher.entity';

export class CreateTeacherInput {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsEnum(TeacherPost)
  @IsNotEmpty()
  post: TeacherPost;
}

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


export class FindAllTeachersResponse {
  teachers: Teacher[];
}
