import { useQuery } from '@tanstack/react-query';
import { getTrainWeather } from '../lib/api.js';

export function useTrainWeather(trainId: string) {
  return useQuery({
    queryKey: ['trainWeather', trainId],
    queryFn: () => getTrainWeather(trainId),
    enabled: Boolean(trainId),
    staleTime: 600000, // 10 minutes
    retry: 1,
  });
}
