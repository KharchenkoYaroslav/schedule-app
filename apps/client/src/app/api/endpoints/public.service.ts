import { apiClient } from '../client';
import { GetGroupScheduleInput } from '../types/public/get-group-schedule.input';
import { GetTeacherScheduleInput } from '../types/public/get-teacher-schedule.input';
import { ScheduleResponse } from '../types/public/schedule.response';
import { SearchGroupInput } from '../types/public/search-group.input';
import { SearchGroupResponse } from '../types/public/search-group.response';
import { SearchTeacherInput } from '../types/public/search-teacher.input';
import { SearchTeacherResponse } from '../types/public/search-teacher.response';

export class PublicService {
  async getGroupSchedule(
    input: GetGroupScheduleInput,
  ): Promise<ScheduleResponse> {
    const { data } = await apiClient.get<ScheduleResponse>(
      `/schedule/group-schedule`,
      { params: input },
    );
    return data;
  }

  async getTeacherSchedule(
    input: GetTeacherScheduleInput,
  ): Promise<ScheduleResponse> {
    const { data } = await apiClient.get<ScheduleResponse>(
      `/schedule/teacher-schedule`,
      { params: input },
    );
    return data;
  }

  async searchGroup(input: SearchGroupInput): Promise<SearchGroupResponse> {
    const { data } = await apiClient.get<SearchGroupResponse>(
      `/schedule/search-group`,
      { params: input },
    );
    return data;
  }

  async searchTeacher(
    input: SearchTeacherInput,
  ): Promise<SearchTeacherResponse> {
    const { data } = await apiClient.get<SearchTeacherResponse>(
      `/schedule/search-teacher`,
      { params: input },
    );
    return data;
  }
}
