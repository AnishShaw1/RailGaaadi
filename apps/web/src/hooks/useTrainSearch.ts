import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchTrains } from '../lib/api.js';

export function useTrainSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 450);

    return () => clearTimeout(handler);
  }, [query]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trainSearch', debouncedQuery],
    queryFn: () => searchTrains(debouncedQuery),
    enabled: debouncedQuery.length >= 3,
    staleTime: 300000, // 5 minutes
  });

  return {
    query,
    setQuery,
    debouncedQuery,
    results: data?.data || [],
    meta: data?.meta,
    isLoading: isLoading && debouncedQuery.length >= 3,
    isError,
    error,
    refetch,
  };
}
