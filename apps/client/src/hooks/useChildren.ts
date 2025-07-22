import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Child, CreateChildInput, UpdateChildInput } from '@/types';

export const useMyChildren = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: async (): Promise<{ children: Child[] }> =>
      apiClient.get('/children/my-children'),
  });

  const createChildMutation = useMutation({
    mutationFn: (data: CreateChildInput) => 
      apiClient.post('/children', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent', 'children'] });
    },
  });

  const updateChildMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChildInput }) =>
      apiClient.put(`/children/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent', 'children'] });
    },
  });

  return {
    children: query.data?.children ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createChild: createChildMutation.mutateAsync,
    updateChild: updateChildMutation.mutateAsync,
    isCreating: createChildMutation.isPending,
    isUpdating: updateChildMutation.isPending,
  };
};
