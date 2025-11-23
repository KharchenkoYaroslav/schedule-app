import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SemesterNumber } from '../type/SemesterNumber.enum';

export class GetPairsByCriteriaDto {
  @IsEnum(SemesterNumber)
  semester: SemesterNumber;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;
}
