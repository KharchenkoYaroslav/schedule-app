import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GroupDto } from '../type/group.dto';

export class FindAllGroupsResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupDto)
  groups: GroupDto[];
}
