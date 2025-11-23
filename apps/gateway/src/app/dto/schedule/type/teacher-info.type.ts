import { IsString } from 'class-validator';

export class TeacherInfo {
  @IsString()
  id: string;

  @IsString()
  fullName: string;

  @IsString()
  department: string;
}
