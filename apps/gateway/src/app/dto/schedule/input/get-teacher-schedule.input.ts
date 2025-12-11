import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SemesterNumber } from '../type/SemesterNumber.enum';

export class GetTeacherScheduleInput {
  @ApiProperty({ description: 'Unique identifier of the teacher', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  teacherId: string;

  @ApiProperty({ description: 'Semester number', enum: SemesterNumber, example: SemesterNumber.FIRST })
  @IsEnum(SemesterNumber)
  semesterNumber: SemesterNumber;
}
