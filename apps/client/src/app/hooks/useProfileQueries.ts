import { useMutation } from '@tanstack/react-query';
import { ProfileService } from '../api/endpoints/profile.servise';
import { ChangeLoginInput } from '../api/types/profile/change-login.input';
import { ChangePasswordInput } from '../api/types/profile/change-password.input';

const profileService = new ProfileService();
const PROFILE_QUERY_KEY = 'profile';

export const useChangeLoginMutation = () => {
  return useMutation({
    mutationKey: [PROFILE_QUERY_KEY, 'change-login'],
    mutationFn: (input: ChangeLoginInput) => profileService.changeLogin(input),
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationKey: [PROFILE_QUERY_KEY, 'change-password'],
    mutationFn: (input: ChangePasswordInput) =>
      profileService.changePassword(input),
  });
};

export const useDeleteAccountMutation = () => {
  return useMutation({
    mutationKey: [PROFILE_QUERY_KEY, 'delete-account'],
    mutationFn: () => profileService.deleteAccount(),
  });
};
