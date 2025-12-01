import { IsString, IsEnum } from 'class-validator';
import { SemesterNumber } from '../enums/SemesterNumber.enum';

export class GetTeacherScheduleInput {
  @IsString()
  teacherId?: string;

  @IsEnum(SemesterNumber)
  semesterNumber?: SemesterNumber;
}
