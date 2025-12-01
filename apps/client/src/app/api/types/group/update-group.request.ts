import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateGroupInput } from './update-group.input';

export class UpdateGroupRequest {
  @IsString()
  id?: string;

  @ValidateNested()
  @Type(() => UpdateGroupInput)
  input?: UpdateGroupInput;
}
