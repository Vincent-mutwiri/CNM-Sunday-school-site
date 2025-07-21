import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Child } from '@/types';

export const useMyChildren = () => {
  const query = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: async (): Promise<{ children: Child[] }> =>
      apiClient.get('/children/my-children'),
  });

  return {
    children: query.data?.children ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
