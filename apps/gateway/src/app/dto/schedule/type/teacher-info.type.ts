import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TeacherInfo {
  @ApiProperty({ description: 'Unique identifier of the teacher', example: '987fcdeb-51a2-43d1-a456-426614174000' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Full name of the teacher', example: 'John Doe' })
  @IsString()
  fullName: string;
}
