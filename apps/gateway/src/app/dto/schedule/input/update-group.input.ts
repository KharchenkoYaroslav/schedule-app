import { IsOptional, IsString } from 'class-validator';

export class UpdateGroupInput {
  @IsOptional()
  @IsString()
  groupCode?: string;

  @IsOptional()
  @IsString()
  faculty?: string;
}
