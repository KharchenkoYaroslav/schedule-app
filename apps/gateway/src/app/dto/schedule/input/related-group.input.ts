import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RelatedGroupInput {
  @ApiProperty({ description: 'Group ID', example: '123e4567-e89b-12d3-a456-426614174000' })
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
