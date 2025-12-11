import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateGroupAction } from '../type/UpdateGroupAction.enum';

export class UpdateGroupsDto {
  @ApiProperty({ description: 'Apdate to next year or privious', enum: UpdateGroupAction, example: UpdateGroupAction.MOVE_TO_NEXT_YEAR })
  @IsEnum(UpdateGroupAction)
  action: UpdateGroupAction;
}
