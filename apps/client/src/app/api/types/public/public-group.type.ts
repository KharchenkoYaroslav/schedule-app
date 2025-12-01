import { IsString } from 'class-validator';

export class PublicGroup {
  @IsString()
  id?: string;

  @IsString()
  groupCode?: string;

  @IsString()
  faculty?: string;
}
