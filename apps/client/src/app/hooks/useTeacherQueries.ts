import { useMutation, useQuery } from '@tanstack/react-query';
import { TeacherService } from '../api/endpoints/teacher.service';
import { FindAllTeachersResponse } from '../api/types/teacher/find-all-teachers.response';
import { TeacherDto } from '../api/types/teacher/teacher.dto';
import { UpdateTeacherRequest } from '../api/types/teacher/update-teacher.request';
import { CreateTeacherInput } from '../api/types/teacher/create-teacher.input';

const teacherService = new TeacherService();
const TEACHER_QUERY_KEY = 'teacher';

export const useFindAllTeachersQuery = () => {
	return useQuery<FindAllTeachersResponse>({
		queryKey: [TEACHER_QUERY_KEY, 'find-all'],
		queryFn: () => teacherService.findAllTeachers(),
	});
};

export const useGetTeacherInfoQuery = (id: string) => {
	return useQuery<TeacherDto>({
		queryKey: [TEACHER_QUERY_KEY, 'info', id],
		queryFn: () => teacherService.getTeacherInfo(id),
		enabled: !!id,
	});
};

export const useUpdateTeacherMutation = () => {
	return useMutation({
		mutationKey: [TEACHER_QUERY_KEY, 'update'],
		mutationFn: (input: UpdateTeacherRequest) =>
			teacherService.updateTeacher(input),
	});
};

export const useDeleteTeacherMutation = () => {
	return useMutation({
		mutationKey: [TEACHER_QUERY_KEY, 'delete'],
		mutationFn: (id: string) => teacherService.deleteTeacher(id),
	});
};

export const useCreateTeacherMutation = () => {
	return useMutation({
		mutationKey: [TEACHER_QUERY_KEY, 'create'],
		mutationFn: (input: CreateTeacherInput) =>
			teacherService.createTeacher(input),
	});
};

