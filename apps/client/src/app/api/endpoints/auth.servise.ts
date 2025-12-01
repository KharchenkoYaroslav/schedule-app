import { apiClient } from '../client';
import { LoginInput } from '../types/auth/login.input';
import { LoginResponse } from '../types/auth/login.response';
import { RegisterInput } from '../types/auth/register.input';
import { VerifyResponse } from '../types/auth/verify.response';

export class AuthService {
  async login(input: LoginInput): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', input);
    return data;
  }

  async register(input: RegisterInput): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      '/auth/register',
      input,
    );
    return data;
  }

  async verify(token: string): Promise<VerifyResponse> {
    const { data } = await apiClient.get<VerifyResponse>('/auth/verify', {
      params: { token },
    });
    return data;
  }
}
