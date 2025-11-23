import { IsString, IsUUID } from 'class-validator';

export class AddLogDto {
  @IsUUID()
  adminId!: string;

  @IsString()
  details!: string;
}
