import { useQuery } from '@tanstack/react-query';
import { getTrainStatus } from '../lib/api.js';

export function useTrainStatus(trainId: string, date?: string) {
  return useQuery({
    queryKey: ['trainStatus', trainId, date],
    queryFn: () => getTrainStatus(trainId, date),
    enabled: Boolean(trainId),
    refetchInterval: false, // Purely on-demand via the Refresh button to conserve API quota
    refetchIntervalInBackground: false,
    staleTime: 60000,
  });
}
