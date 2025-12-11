import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SemesterNumber } from '../type/SemesterNumber.enum';

export class GetPairsByCriteriaDto {
  @ApiProperty({ description: 'Semester number', enum: SemesterNumber, example: SemesterNumber.FIRST })
  @IsEnum(SemesterNumber)
  semester: SemesterNumber;

  @ApiProperty({ description: 'Filter by group ID', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiProperty({ description: 'Filter by teacher ID', example: '987fcdeb-51a2-43d1-a456-426614174000', required: false })
  @IsOptional()
  @IsString()
  teacherId?: string;
}
