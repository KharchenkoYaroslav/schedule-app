import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScheduleService } from '../api/endpoints/schedule.service';
import { AddPairDto } from '../api/types/schedule/add-pair.dto';
import { EditPairDto } from '../api/types/schedule/edit-pair.dto';
import { GetPairsByCriteriaDto } from '../api/types/schedule/get-pairs-by-criteria.dto';
import { GetPairsByCriteriaResponse } from '../api/types/schedule/get-pairs-by-criteria.response';
import { GetPairInfoResponse } from '../api/types/schedule/get-pair-info.response';
import { SwapGroupPairsDto } from '../api/types/schedule/swap-group-pairs.dto';
import { SwapTeacherPairsDto } from '../api/types/schedule/swap-teacher-pairs.dto';

const scheduleService = new ScheduleService();
const SCHEDULE_QUERY_KEY = 'schedule';

export const useAddPairMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [SCHEDULE_QUERY_KEY, 'add-pair'],
    mutationFn: (input: AddPairDto) => scheduleService.addPair(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEY] });
    },
  });
};

export const useEditPairMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [SCHEDULE_QUERY_KEY, 'edit-pair'],
    mutationFn: (input: EditPairDto) => scheduleService.editPair(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEY] });
    },
  });
};

export const useDeletePairMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [SCHEDULE_QUERY_KEY, 'delete-pair'],
    mutationFn: (id: string) => scheduleService.deletePair(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEY] });
    },
  });
};

export const useGetPairsByCriteriaQuery = (input: GetPairsByCriteriaDto) => {
  return useQuery<GetPairsByCriteriaResponse>({
    queryKey: [SCHEDULE_QUERY_KEY, 'pairs-by-criteria', input],
    queryFn: () => scheduleService.getPairsByCriteria(input),
    enabled: !!input.groupId || !!input.teacherId,
  });
};

export const useGetPairInfoQuery = (id: string) => {
  return useQuery<GetPairInfoResponse>({
    queryKey: [SCHEDULE_QUERY_KEY, 'pair-info', id],
    queryFn: () => scheduleService.getPairInfo(id),
    enabled: !!id,
  });
};

export const useLazyGetPairInfoQuery = () => {
  const queryClient = useQueryClient();
  return (id: string) =>
    queryClient.fetchQuery({
      queryKey: [SCHEDULE_QUERY_KEY, 'pair-info', id],
      queryFn: () => scheduleService.getPairInfo(id),
      staleTime: 1000 * 60 * 5, 
    });
};

export const useSwapGroupPairsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [SCHEDULE_QUERY_KEY, 'swap-group-pairs'],
    mutationFn: (input: SwapGroupPairsDto) => scheduleService.swapGroupPairs(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEY] });
    },
  });
};

export const useSwapTeacherPairsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [SCHEDULE_QUERY_KEY, 'swap-teacher-pairs'],
    mutationFn: (input: SwapTeacherPairsDto) => scheduleService.swapTeacherPairs(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEY] });
    },
  });
};
