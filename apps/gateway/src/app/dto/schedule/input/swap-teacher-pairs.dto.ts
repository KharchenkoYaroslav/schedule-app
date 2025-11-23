import { IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SemesterNumber } from '../type/SemesterNumber.enum';
import { SwapTeacherLocationDto } from './swap-teacher-location.dto';

export class SwapTeacherPairsDto {
  @IsEnum(SemesterNumber)
  semester: SemesterNumber;

  @ValidateNested()
  @Type(() => SwapTeacherLocationDto)
  source: SwapTeacherLocationDto;

  @ValidateNested()
  @Type(() => SwapTeacherLocationDto)
  destination: SwapTeacherLocationDto;
}
