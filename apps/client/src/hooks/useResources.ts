import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Resource } from '@/types';

export const useResources = (filters?: { type?: string; classId?: string }) => {
  const query = useQuery({
    queryKey: ['resources', filters],
    queryFn: async (): Promise<{ resources: Resource[] }> => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.classId) params.append('classId', filters.classId);
      const queryString = params.toString();
      const endpoint = queryString ? `/resources?${queryString}` : '/resources';
      return apiClient.get(endpoint);
    },
  });

  return {
    resources: query.data?.resources ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useUploadResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) =>
      apiClient.uploadFile('/resources/upload', formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resources'] }),
  });
};
