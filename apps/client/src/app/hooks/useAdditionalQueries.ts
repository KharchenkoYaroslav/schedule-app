import { useMutation } from '@tanstack/react-query';
import { AdditionalService } from '../api/endpoints/additional.service';
import { UpdateGroupsDto } from '../api/types/additional/update-groups.dto';

const additionalService = new AdditionalService();
const ADDITIONAL_QUERY_KEY = 'additional';

export const useUpdateGroupsMutation = () => {
	return useMutation({
		mutationKey: [ADDITIONAL_QUERY_KEY, 'update-groups'],
		mutationFn: (input: UpdateGroupsDto) =>
			additionalService.updateGroups(input),
	});
};

