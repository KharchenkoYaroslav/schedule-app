import { IsString } from 'class-validator';

export class CreateGroupInput {
  @IsString()
  groupCode: string;

  @IsString()
  faculty: string;
}
