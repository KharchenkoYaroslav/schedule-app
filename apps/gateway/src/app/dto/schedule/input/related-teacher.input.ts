import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RelatedTeacherInput {
  @ApiProperty({ description: 'Teacher ID', example: '987fcdeb-51a2-43d1-a456-426614174000' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Planned lecture hours', example: 2 })
  @IsNumber()
  plannedLectures: number;

  @ApiProperty({ description: 'Planned practical hours', example: 2 })
  @IsNumber()
  plannedPracticals: number;

  @ApiProperty({ description: 'Planned lab hours', example: 2 })
  @IsNumber()
  plannedLabs: number;
}
