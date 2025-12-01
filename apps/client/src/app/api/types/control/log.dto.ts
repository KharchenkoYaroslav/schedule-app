import { IsString, IsUUID, IsDate } from 'class-validator';
export class LogDto {
  @IsUUID()
  id!: string;
  @IsUUID()
  adminId!: string;
  @IsString()
  details!: string;
  @IsDate()
  createdAt!: Date;
}
