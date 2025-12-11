import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupInput {
  @ApiProperty({ description: 'Code of the group', example: 'AB-51' })
  @IsString()
  groupCode: string;

  @ApiProperty({ description: 'Faculty name', example: 'IPZE' })
  @IsString()
  faculty: string;
}
