import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GroupDto {
  @ApiProperty({ description: 'Unique identifier of the group', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Code of the group', example: 'AB-51' })
  @IsString()
  groupCode: string;

  @ApiProperty({ description: 'Faculty of the group', example: 'IPZE' })
  @IsString()
  faculty: string;
}
