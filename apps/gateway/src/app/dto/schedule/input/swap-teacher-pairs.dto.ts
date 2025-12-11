import { IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SemesterNumber } from '../type/SemesterNumber.enum';
import { SwapTeacherLocationDto } from './swap-teacher-location.dto';

export class SwapTeacherPairsDto {
  @ApiProperty({ description: 'Semester number', enum: SemesterNumber, example: SemesterNumber.FIRST })
  @IsEnum(SemesterNumber)
  semester: SemesterNumber;

  @ApiProperty({ description: 'Source location coordinates', type: SwapTeacherLocationDto })
  @ValidateNested()
  @Type(() => SwapTeacherLocationDto)
  source: SwapTeacherLocationDto;

  @ApiProperty({ description: 'Destination location coordinates', type: SwapTeacherLocationDto })
  @ValidateNested()
  @Type(() => SwapTeacherLocationDto)
  destination: SwapTeacherLocationDto;
}
