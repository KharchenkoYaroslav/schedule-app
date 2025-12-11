import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupInput {
  @ApiProperty({ description: 'New group code', example: 'CD-51', required: false })
  @IsOptional()
  @IsString()
  groupCode?: string;

  @ApiProperty({ description: 'New faculty name', example: 'IPZE', required: false })
  @IsOptional()
  @IsString()
  faculty?: string;
}
