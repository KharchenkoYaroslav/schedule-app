import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthService } from '../api/endpoints/auth.servise';
import { LoginInput } from '../api/types/auth/login.input';
import { RegisterInput } from '../api/types/auth/register.input';

const authService = new AuthService();
const AUTH_QUERY_KEY = 'auth';

export const useLoginMutation = () => {
  return useMutation({
    mutationKey: [AUTH_QUERY_KEY, 'login'],
    mutationFn: (input: LoginInput) => authService.login(input),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationKey: [AUTH_QUERY_KEY, 'register'],
    mutationFn: (input: RegisterInput) => authService.register(input),
  });
};

export const useVerifyQuery = (token: string) => {
  return useQuery({
    queryKey: [AUTH_QUERY_KEY, 'verify', token],
    queryFn: () => authService.verify(token),
    enabled: !!token,
  });
};
