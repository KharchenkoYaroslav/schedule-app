import { useQuery } from '@tanstack/react-query';
import { PublicService } from '../api/endpoints/public.service';
import { GetGroupScheduleInput } from '../api/types/public/get-group-schedule.input';
import { GetTeacherScheduleInput } from '../api/types/public/get-teacher-schedule.input';
import { SearchGroupInput } from '../api/types/public/search-group.input';
import { SearchTeacherInput } from '../api/types/public/search-teacher.input';

const publicService = new PublicService();
const PUBLIC_QUERY_KEY = 'public';

export const useGetGroupScheduleQuery = (input: GetGroupScheduleInput) => {
  return useQuery({
    queryKey: [PUBLIC_QUERY_KEY, 'group-schedule', input],
    queryFn: () => publicService.getGroupSchedule(input),
    enabled: !!input.groupId,
  });
};

export const useGetTeacherScheduleQuery = (input: GetTeacherScheduleInput) => {
  return useQuery({
    queryKey: [PUBLIC_QUERY_KEY, 'teacher-schedule', input],
    queryFn: () => publicService.getTeacherSchedule(input),
    enabled: !!input.teacherId,
  });
};

export const useSearchGroupQuery = (input: SearchGroupInput, enabled = true) => {
  return useQuery({
    queryKey: [PUBLIC_QUERY_KEY, 'search-group', input],
    queryFn: () => publicService.searchGroup(input),
    enabled: enabled && !!input.groupCode,
  });
};

export const useSearchTeacherQuery = (
  input: SearchTeacherInput,
  enabled = true,
) => {
  return useQuery({
    queryKey: [PUBLIC_QUERY_KEY, 'search-teacher', input],
    queryFn: () => publicService.searchTeacher(input),
    enabled: enabled && !!input.fullName,
  });
};
