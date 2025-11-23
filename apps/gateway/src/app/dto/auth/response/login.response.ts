import { UserRole } from '../types/user-role.enum';
export class LoginResponse {
  token!: string;
  userId!: string;
  login!: string;
  role!: UserRole;
  createdAt!: string;
}
