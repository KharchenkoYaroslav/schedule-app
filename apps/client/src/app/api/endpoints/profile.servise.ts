import { apiClient } from '../client';
import { ChangeLoginInput } from '../types/profile/change-login.input';
import { ChangePasswordInput } from '../types/profile/change-password.input';

export class ProfileService {
  async changeLogin(input: ChangeLoginInput): Promise<void> {
    await apiClient.patch('/auth/change-login', input);
  }

  async changePassword(input: ChangePasswordInput): Promise<void> {
    await apiClient.patch('/auth/change-password', input);
  }

  async deleteAccount(): Promise<void> {
    await apiClient.delete('/auth/delete-account');
  }
}
