import { IsEnum } from 'class-validator';
import { UpdateGroupAction } from '../enums/UpdateGroupAction.enum';

export class UpdateGroupsDto {
  @IsEnum(UpdateGroupAction)
  action?: UpdateGroupAction;
}
