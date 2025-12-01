import { apiClient } from '../client';
import { FindAllGroupsResponse } from '../types/group/find-all-groups.response';
import { GroupDto } from '../types/group/group.dto';
import { UpdateGroupRequest } from '../types/group/update-group.request';
import { CreateGroupInput } from '../types/group/create-group.input';

export class GroupService {
  private readonly BASE_URL = '/schedule/admin/group';

  async findAllGroups(): Promise<FindAllGroupsResponse> {
    const { data } = await apiClient.get<FindAllGroupsResponse>(
      '/schedule/admin/groups',
    );
    return data;
  }

  async getGroupInfo(id: string): Promise<GroupDto> {
    const { data } = await apiClient.get<GroupDto>(`${this.BASE_URL}/${id}`);
    return data;
  }

  async updateGroup(input: UpdateGroupRequest): Promise<void> {
    await apiClient.patch<void>(`${this.BASE_URL}/${input.id}`, input.input);
  }

  async deleteGroup(id: string): Promise<void> {
    await apiClient.delete<void>(`${this.BASE_URL}/${id}`);
  }

  async createGroup(input: CreateGroupInput): Promise<void> {
    await apiClient.post<void>(this.BASE_URL, input);
  }
}

export const groupService = new GroupService();
