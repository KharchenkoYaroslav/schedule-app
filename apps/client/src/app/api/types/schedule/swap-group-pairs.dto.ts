import { IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SemesterNumber } from '../enums/SemesterNumber.enum';
import { GroupLocationDto } from './group-location.dto';

export class SwapGroupPairsDto {
  @IsEnum(SemesterNumber)
  semester?: SemesterNumber;

  @ValidateNested()
  @Type(() => GroupLocationDto)
  source?: GroupLocationDto;

  @ValidateNested()
  @Type(() => GroupLocationDto)
  destination?: GroupLocationDto;
}
