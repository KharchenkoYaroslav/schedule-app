import { apiClient } from '../client';
import { UpdateGroupsDto } from '../types/additional/update-groups.dto';

export class AdditionalService {
  private readonly BASE_URL = '/schedule/admin';

  async updateGroups(input: UpdateGroupsDto): Promise<void> {
    await apiClient.post<void>(`${this.BASE_URL}/update-groups`, input);
  }
}

export const additionalService = new AdditionalService();
