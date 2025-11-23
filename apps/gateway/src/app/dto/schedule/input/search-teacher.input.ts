import { IsString } from 'class-validator';

export class SearchTeacherInput {
  @IsString()
  fullName: string;
}
