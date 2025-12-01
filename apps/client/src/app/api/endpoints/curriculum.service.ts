import { apiClient } from '../client';
import { FindAllCurriculumsResponse } from '../types/curriculum/find-all-curriculums.response';
import { CurriculumDto } from '../types/curriculum/curriculum.dto';
import { UpdateCurriculumRequest } from '../types/curriculum/update-curriculum.request';
import { CurriculumInput } from '../types/curriculum/curriculum.input';

export class CurriculumService {
  private readonly BASE_URL = '/schedule/admin/curriculum';

  async findAllCurriculums(): Promise<FindAllCurriculumsResponse> {
    const { data } = await apiClient.get<FindAllCurriculumsResponse>(
      `${this.BASE_URL}s`, 
    );
    return data;
  }

  async getCurriculumInfo(id: string): Promise<CurriculumDto> {
    const { data } = await apiClient.get<CurriculumDto>(
      `${this.BASE_URL}/${id}`,
    );
    return data;
  }

  async updateCurriculum(
    input: UpdateCurriculumRequest,
  ): Promise<void> {
    await apiClient.patch<void>(
      `${this.BASE_URL}/${input.id}`,
      input.input,
    );
  }

  async deleteCurriculum(id: string): Promise<void> {
    await apiClient.delete<void>(`${this.BASE_URL}/${id}`);
  }

  async createCurriculum(input: CurriculumInput): Promise<void> {
    await apiClient.post<void>(this.BASE_URL, input);
  }
}

export const curriculumService = new CurriculumService();
