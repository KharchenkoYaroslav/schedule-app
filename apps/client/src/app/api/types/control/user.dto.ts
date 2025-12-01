import { UserRole } from '../enums/user-role.enum';

export class UserDto {
  id?: string;
  login?: string;
  role?: UserRole;
}
