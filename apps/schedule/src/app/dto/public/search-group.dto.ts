import { IsString } from 'class-validator';

export class SearchGroupInput {
  @IsString()
  groupCode: string;
}

export class GroupSearchItem {
  id: string;
  groupCode: string;
}

export class SearchGroupResponse {
  groups: GroupSearchItem[];
}
