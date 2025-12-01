
import { useMutation, useQuery } from '@tanstack/react-query';
import { CurriculumService } from '../api/endpoints/curriculum.service';
import { FindAllCurriculumsResponse } from '../api/types/curriculum/find-all-curriculums.response';
import { CurriculumDto } from '../api/types/curriculum/curriculum.dto';
import { UpdateCurriculumRequest } from '../api/types/curriculum/update-curriculum.request';
import { CurriculumInput } from '../api/types/curriculum/curriculum.input';

const curriculumService = new CurriculumService();
const CURRICULUM_QUERY_KEY = 'curriculum';

export const useFindAllCurriculumsQuery = () => {
	return useQuery<FindAllCurriculumsResponse>({
		queryKey: [CURRICULUM_QUERY_KEY, 'find-all'],
		queryFn: () => curriculumService.findAllCurriculums(),
	});
};

export const useGetCurriculumInfoQuery = (id: string) => {
	return useQuery<CurriculumDto>({
		queryKey: [CURRICULUM_QUERY_KEY, 'info', id],
		queryFn: () => curriculumService.getCurriculumInfo(id),
		enabled: !!id,
	});
};

export const useUpdateCurriculumMutation = () => {
	return useMutation({
		mutationKey: [CURRICULUM_QUERY_KEY, 'update'],
		mutationFn: (input: UpdateCurriculumRequest) =>
			curriculumService.updateCurriculum(input),
	});
};

export const useDeleteCurriculumMutation = () => {
	return useMutation({
		mutationKey: [CURRICULUM_QUERY_KEY, 'delete'],
		mutationFn: (id: string) => curriculumService.deleteCurriculum(id),
	});
};

export const useCreateCurriculumMutation = () => {
	return useMutation({
		mutationKey: [CURRICULUM_QUERY_KEY, 'create'],
		mutationFn: (input: CurriculumInput) =>
			curriculumService.createCurriculum(input),
	});
};

