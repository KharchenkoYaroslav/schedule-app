import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchTeacherInput {
  @ApiProperty({ description: 'Teacher name to search for', example: 'John' })
  @IsString()
  fullName: string;
}
