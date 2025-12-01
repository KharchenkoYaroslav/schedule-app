import { apiClient } from '../client';
import { GetLogsDto } from '../types/control/get-logs.dto';
import { LogDto } from '../types/control/log.dto';
import { UsersResponseDto } from '../types/control/users.response';
import { AddAllowedUserInput } from '../types/control/add-allowed-user.input';
import { ChangeUserRoleInput } from '../types/control/change-user-role.input';
import { UserDto } from '../types/control/user.dto';

export class ControlService {
  async getLogs(params: GetLogsDto): Promise<LogDto[]> {
    const { data } = await apiClient.get<LogDto[]>(`schedule/admin/logs`, {
      params,
    });
    return data;
  }

  async getUsers(): Promise<UserDto[]> {
    const { data } = await apiClient.get<UsersResponseDto>(`auth/users`);
    return data.users || [];
  }

  async getAllowedUsers(): Promise<UserDto[]> {
    const { data } = await apiClient.get<UsersResponseDto>(`auth/allowed-users`);
    return data.users || [];
  }

  async addAllowedUser(input: AddAllowedUserInput): Promise<void> {
    await apiClient.post(`auth/add-allowed-user`, input);
  }

  async changeUserRole(input: ChangeUserRoleInput): Promise<void> {
    await apiClient.patch(`auth/change-user-role`, input);
  }

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`auth/user/${userId}`);
  }
}
