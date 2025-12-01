import { IsString } from 'class-validator';

export class SearchGroupInput {
  @IsString()
  groupCode: string;
}
