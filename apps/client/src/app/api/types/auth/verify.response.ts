import { UserRole } from '../enums/user-role.enum';

export class VerifyResponse {
  valid!: boolean;
  userId!: string;
  role!: UserRole;
}
