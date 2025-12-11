import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RelatedGroup {
  @ApiProperty({ description: 'Unique identifier of the group', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Group code', example: 'AB-51' })
  @IsString()
  code: string;

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
