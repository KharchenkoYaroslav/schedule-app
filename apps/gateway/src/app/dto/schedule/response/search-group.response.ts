import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GroupSearchItem } from '../type/group-search-item.type';

export class SearchGroupResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupSearchItem)
  groups: GroupSearchItem[];
}
