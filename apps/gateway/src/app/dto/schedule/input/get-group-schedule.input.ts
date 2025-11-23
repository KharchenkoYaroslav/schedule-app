import { IsString, IsEnum } from 'class-validator';
import { SemesterNumber } from '../type/SemesterNumber.enum';

export class GetGroupScheduleInput {
  @IsString()
  groupId: string;

  @IsEnum(SemesterNumber)
  semesterNumber: SemesterNumber;
}
