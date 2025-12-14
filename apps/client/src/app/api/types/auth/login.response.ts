import { UserRole } from '../enums/user-role.enum';

export class LoginResponse {
  accessToken!: string;
  refreshToken!: string;
  userId!: string;
  login!: string;
  role!: UserRole;
  createdAt!: string;
}
