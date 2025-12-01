import { useMutation, useQuery } from '@tanstack/react-query';
import { ControlService } from '../api/endpoints/control.servise';
import { GetLogsDto } from '../api/types/control/get-logs.dto';
import { AddAllowedUserInput } from '../api/types/control/add-allowed-user.input';
import { ChangeUserRoleInput } from '../api/types/control/change-user-role.input';

const controlService = new ControlService();
const CONTROL_QUERY_KEY = 'control';

export const useGetLogsQuery = (params: GetLogsDto) => {
  return useQuery({
    queryKey: [CONTROL_QUERY_KEY, 'logs', params],
    queryFn: () => controlService.getLogs(params),
  });
};

export const useGetUsersQuery = () => {
  return useQuery({
    queryKey: [CONTROL_QUERY_KEY, 'users'],
    queryFn: () => controlService.getUsers(),
  });
};

export const useGetAllowedUsersQuery = () => {
  return useQuery({
    queryKey: [CONTROL_QUERY_KEY, 'allowed-users'],
    queryFn: () => controlService.getAllowedUsers(),
  });
};

export const useAddAllowedUserMutation = () => {
  return useMutation({
    mutationKey: [CONTROL_QUERY_KEY, 'add-allowed-user'],
    mutationFn: (input: AddAllowedUserInput) =>
      controlService.addAllowedUser(input),
  });
};

export const useChangeUserRoleMutation = () => {
  return useMutation({
    mutationKey: [CONTROL_QUERY_KEY, 'change-user-role'],
    mutationFn: (input: ChangeUserRoleInput) =>
      controlService.changeUserRole(input),
  });
};

export const useDeleteUserMutation = () => {
  return useMutation({
    mutationKey: [CONTROL_QUERY_KEY, 'delete-user'],
    mutationFn: (userId: string) => controlService.deleteUser(userId),
  });
};
