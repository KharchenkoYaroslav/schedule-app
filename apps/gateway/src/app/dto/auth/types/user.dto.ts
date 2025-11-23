import { UserRole } from './user-role.enum';

export class UserDto {
  id: string;
  login: string;
  role: UserRole;
}
