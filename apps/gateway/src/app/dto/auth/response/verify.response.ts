import { UserRole } from '../types/user-role.enum';

export class VerifyResponse {
  valid!: boolean;
  userId!: string;
  role!: UserRole;
}
