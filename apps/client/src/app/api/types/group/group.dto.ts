import { IsString } from 'class-validator';

export class GroupDto {
  @IsString()
  id?: string;

  @IsString()
  groupCode?: string;

  @IsString()
  faculty?: string;
}
