import { IsEnum } from 'class-validator';
import { UpdateGroupAction } from '../type/UpdateGroupAction.enum';

export class UpdateGroupsDto {
  @IsEnum(UpdateGroupAction)
  action: UpdateGroupAction;
}
