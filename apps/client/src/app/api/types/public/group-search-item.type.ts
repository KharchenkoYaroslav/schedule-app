import { IsString } from 'class-validator';

export class GroupSearchItem {
  @IsString()
  id?: string;

  @IsString()
  groupCode?: string;

}
