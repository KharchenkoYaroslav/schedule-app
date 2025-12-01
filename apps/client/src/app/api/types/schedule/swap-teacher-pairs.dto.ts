import { IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SemesterNumber } from '../enums/SemesterNumber.enum';
import { TeacherLocationDto } from './teacher-location.dto';

export class SwapTeacherPairsDto {
  @IsEnum(SemesterNumber)
  semester?: SemesterNumber;

  @ValidateNested()
  @Type(() => TeacherLocationDto)
  source?: TeacherLocationDto;

  @ValidateNested()
  @Type(() => TeacherLocationDto)
  destination?: TeacherLocationDto;
}
