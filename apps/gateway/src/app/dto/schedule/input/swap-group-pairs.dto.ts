import { IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SemesterNumber } from '../type/SemesterNumber.enum';
import { SwapGroupLocationDto } from './swap-group-location.dto';

export class SwapGroupPairsDto {
  @IsEnum(SemesterNumber)
  semester: SemesterNumber;

  @ValidateNested()
  @Type(() => SwapGroupLocationDto)
  source: SwapGroupLocationDto;

  @ValidateNested()
  @Type(() => SwapGroupLocationDto)
  destination: SwapGroupLocationDto;
}
