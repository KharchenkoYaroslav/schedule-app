import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateTeacherInput } from './update-teacher.input';

export class UpdateTeacherRequest {
  @ApiProperty({ description: 'Unique identifier of the teacher', example: '987fcdeb-51a2-43d1-a456-426614174000' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Data to update', type: UpdateTeacherInput })
  @ValidateNested()
  @Type(() => UpdateTeacherInput)
  input: UpdateTeacherInput;
}
