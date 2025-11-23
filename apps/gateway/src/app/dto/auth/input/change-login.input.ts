import { IsString, IsNotEmpty } from 'class-validator';

export class ChangeLoginInput {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  newLogin!: string;
}
