import { apiClient } from '../client';
import { FindAllTeachersResponse } from '../types/teacher/find-all-teachers.response';
import { TeacherDto } from '../types/teacher/teacher.dto';
import { UpdateTeacherRequest } from '../types/teacher/update-teacher.request';
import { CreateTeacherInput } from '../types/teacher/create-teacher.input';

export class TeacherService {
  private readonly BASE_URL = '/schedule/admin/teacher';

  async findAllTeachers(): Promise<FindAllTeachersResponse> {
    const { data } = await apiClient.get<FindAllTeachersResponse>(
      '/schedule/admin/teachers',
    );
    return data;
  }

  async getTeacherInfo(id: string): Promise<TeacherDto> {
    const { data } = await apiClient.get<TeacherDto>(`${this.BASE_URL}/${id}`);
    return data;
  }

  async updateTeacher(input: UpdateTeacherRequest): Promise<void> {
    await apiClient.patch<void>(
      `${this.BASE_URL}/${input.id}`,
      input.input,
    );
  }

  async deleteTeacher(id: string): Promise<void> {
    await apiClient.delete<void>(`${this.BASE_URL}/${id}`);
  }

  async createTeacher(input: CreateTeacherInput): Promise<void> {
    await apiClient.post<void>(this.BASE_URL, input);
  }
}

export const teacherService = new TeacherService();
