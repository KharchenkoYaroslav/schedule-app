import { IsUUID } from 'class-validator';

export class DeleteAllowedUserInput {
  @IsUUID()
  userId!: string;
}
