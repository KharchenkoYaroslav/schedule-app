import { useMutation, useQuery } from '@tanstack/react-query';
import { GroupService } from '../api/endpoints/group.servise';
import { FindAllGroupsResponse } from '../api/types/group/find-all-groups.response';
import { GroupDto } from '../api/types/group/group.dto';
import { UpdateGroupRequest } from '../api/types/group/update-group.request';
import { CreateGroupInput } from '../api/types/group/create-group.input';

const groupService = new GroupService();
const GROUP_QUERY_KEY = 'group';

export const useFindAllGroupsQuery = () => {
	return useQuery<FindAllGroupsResponse>({
		queryKey: [GROUP_QUERY_KEY, 'find-all'],
		queryFn: () => groupService.findAllGroups(),
	});
};

export const useGetGroupInfoQuery = (id: string) => {
	return useQuery<GroupDto>({
		queryKey: [GROUP_QUERY_KEY, 'info', id],
		queryFn: () => groupService.getGroupInfo(id),
		enabled: !!id,
	});
};

export const useUpdateGroupMutation = () => {
	return useMutation({
		mutationKey: [GROUP_QUERY_KEY, 'update'],
		mutationFn: (input: UpdateGroupRequest) => groupService.updateGroup(input),
	});
};

export const useDeleteGroupMutation = () => {
	return useMutation({
		mutationKey: [GROUP_QUERY_KEY, 'delete'],
		mutationFn: (id: string) => groupService.deleteGroup(id),
	});
};

export const useCreateGroupMutation = () => {
	return useMutation({
		mutationKey: [GROUP_QUERY_KEY, 'create'],
		mutationFn: (input: CreateGroupInput) => groupService.createGroup(input),
	});
};

