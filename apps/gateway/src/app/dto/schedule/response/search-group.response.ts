import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { GroupSearchItem } from '../type/group-search-item.type';

export class SearchGroupResponse {
  @ApiProperty({ description: 'List of groups found', type: [GroupSearchItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupSearchItem)
  groups: GroupSearchItem[];
}
