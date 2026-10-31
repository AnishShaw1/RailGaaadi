import { useQuery } from '@tanstack/react-query';
import { getTrainRoute } from '../lib/api.js';

export function useTrainRoute(trainId: string) {
  return useQuery({
    queryKey: ['trainRoute', trainId],
    queryFn: () => getTrainRoute(trainId),
    enabled: Boolean(trainId),
    staleTime: 86400000, // 24 hours
  });
}
