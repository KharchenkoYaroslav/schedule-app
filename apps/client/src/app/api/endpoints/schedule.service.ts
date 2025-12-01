import { apiClient } from '../client';
import { AddPairDto } from '../types/schedule/add-pair.dto';
import { EditPairDto } from '../types/schedule/edit-pair.dto';
import { GetPairsByCriteriaDto } from '../types/schedule/get-pairs-by-criteria.dto';
import { GetPairsByCriteriaResponse } from '../types/schedule/get-pairs-by-criteria.response';
import { GetPairInfoResponse } from '../types/schedule/get-pair-info.response';
import { SwapGroupPairsDto } from '../types/schedule/swap-group-pairs.dto';
import { SwapTeacherPairsDto } from '../types/schedule/swap-teacher-pairs.dto';

export class ScheduleService {
  private readonly BASE_URL = '/schedule/admin';

  async addPair(input: AddPairDto): Promise<void> {
    await apiClient.post<void>(`${this.BASE_URL}/pair`, input);
  }

  async editPair(input: EditPairDto): Promise<void> {
    await apiClient.patch<void>(`${this.BASE_URL}/pair`, input);
  }

  async deletePair(id: string): Promise<void> {
    await apiClient.delete<void>(`${this.BASE_URL}/pair/${id}`);
  }

  async getPairsByCriteria(
    input: GetPairsByCriteriaDto,
  ): Promise<GetPairsByCriteriaResponse> {
    const { data } = await apiClient.get<GetPairsByCriteriaResponse>(
      `${this.BASE_URL}/pairs-by-criteria`,
      { params: input },
    );
    return data;
  }

  async getPairInfo(id: string): Promise<GetPairInfoResponse> {
    const { data } = await apiClient.get<GetPairInfoResponse>(
      `${this.BASE_URL}/pair-info/${id}`,
    );
    return data;
  }

  async swapGroupPairs(input: SwapGroupPairsDto): Promise<void> {
    await apiClient.post<void>(`${this.BASE_URL}/swap-group-pairs`, input);
  }

  async swapTeacherPairs(input: SwapTeacherPairsDto): Promise<void> {
    await apiClient.post<void>(`${this.BASE_URL}/swap-teacher-pairs`, input);
  }
}

export const scheduleService = new ScheduleService();
