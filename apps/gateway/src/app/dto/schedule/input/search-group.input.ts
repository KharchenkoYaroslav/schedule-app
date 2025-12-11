import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchGroupInput {
  @ApiProperty({ description: 'Group code to search for', example: 'AB-5' })
  @IsString()
  groupCode: string;
}
