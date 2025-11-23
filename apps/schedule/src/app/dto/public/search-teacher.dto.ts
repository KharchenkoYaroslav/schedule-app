import { IsString } from 'class-validator';

export class SearchTeacherInput {
  @IsString()
  fullName: string;
}

export class TeacherInfo {
  id: string;
  fullName: string;
  department: string;
}

export class SearchTeacherResponse {
  teachers: TeacherInfo[];
}
