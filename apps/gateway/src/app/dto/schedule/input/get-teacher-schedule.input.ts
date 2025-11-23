import { IsString, IsEnum } from 'class-validator';
import { SemesterNumber } from '../type/SemesterNumber.enum';

export class GetTeacherScheduleInput {
  @IsString()
  teacherId: string;

  @IsEnum(SemesterNumber)
  semesterNumber: SemesterNumber;
}
