import { IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SemesterNumber } from '../type/SemesterNumber.enum';
import { SwapGroupLocationDto } from './swap-group-location.dto';

export class SwapGroupPairsDto {
  @ApiProperty({ description: 'Semester number', enum: SemesterNumber, example: SemesterNumber.FIRST })
  @IsEnum(SemesterNumber)
  semester: SemesterNumber;

  @ApiProperty({ description: 'Source location coordinates', type: SwapGroupLocationDto })
  @ValidateNested()
  @Type(() => SwapGroupLocationDto)
  source: SwapGroupLocationDto;

  @ApiProperty({ description: 'Destination location coordinates', type: SwapGroupLocationDto })
  @ValidateNested()
  @Type(() => SwapGroupLocationDto)
  destination: SwapGroupLocationDto;
}
