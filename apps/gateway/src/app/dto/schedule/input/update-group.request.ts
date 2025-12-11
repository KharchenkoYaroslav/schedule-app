import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateGroupInput } from './update-group.input';

export class UpdateGroupRequest {
  @ApiProperty({ description: 'Unique identifier of the group', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Data to update', type: UpdateGroupInput })
  @ValidateNested()
  @Type(() => UpdateGroupInput)
  input: UpdateGroupInput;
}
