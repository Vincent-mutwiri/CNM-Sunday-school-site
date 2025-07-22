import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Settings } from '@/types';

export const useSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['settings'],
    queryFn: async (): Promise<{ settings: Settings }> => apiClient.get('/settings'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Settings>) => apiClient.put('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  return {
    settings: query.data?.settings,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
