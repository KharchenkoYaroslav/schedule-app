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

  constructor(log?: {
    id: string;
    adminId: string;
    details: string;
    createdAt: Date;
  }) {
    if (log) {
      this.id = log.id;
      this.adminId = log.adminId;
      this.details = log.details;
      this.createdAt = log.createdAt;
    }
  }
}
