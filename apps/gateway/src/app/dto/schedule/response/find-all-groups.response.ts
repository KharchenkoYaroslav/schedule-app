import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { GroupDto } from '../type/group.dto';

export class FindAllGroupsResponse {
  @ApiProperty({ description: 'List of all groups', type: [GroupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupDto)
  groups: GroupDto[];
}
