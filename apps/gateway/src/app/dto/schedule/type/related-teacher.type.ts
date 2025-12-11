import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RelatedTeacher {
  @ApiProperty({ description: 'Unique identifier of the teacher', example: '987fcdeb-51a2-43d1-a456-426614174000' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Full name of the teacher', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Planned lecture hours', example: 2 })
  @IsNumber()
  plannedLectures: number;

  @ApiProperty({ description: 'Planned practical hours', example: 2 })
  @IsNumber()
  plannedPracticals: number;

  @ApiProperty({ description: 'Planned lab hours', example: 2 })
  @IsNumber()
  plannedLabs: number;

  @ApiProperty({ description: 'Scheduled lecture hours', example: 2 })
  @IsNumber()
  scheduledLectures: number;

  @ApiProperty({ description: 'Scheduled practical hours', example: 2 })
  @IsNumber()
  scheduledPracticals: number;

  @ApiProperty({ description: 'Scheduled lab hours', example: 2 })
  @IsNumber()
  scheduledLabs: number;
}
