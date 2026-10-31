import { useQuery } from '@tanstack/react-query';
import { getTrainElevation } from '../lib/api.js';

export function useTrainElevation(trainId: string) {
  return useQuery({
    queryKey: ['trainElevation', trainId],
    queryFn: () => getTrainElevation(trainId),
    enabled: Boolean(trainId),
    staleTime: 86400000 * 7, // 7 days
    retry: 1,
  });
}
