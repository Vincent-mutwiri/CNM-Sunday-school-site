import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { GalleryImage } from '@/types';

export const useGalleryImages = () => {
  const query = useQuery({
    queryKey: ['gallery', 'images'],
    queryFn: async (): Promise<{ images: GalleryImage[] }> => apiClient.get('/gallery'),
  });

  return {
    images: query.data?.images ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useUploadGalleryImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) =>
      apiClient.uploadFile('/gallery/upload', formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery', 'images'] }),
  });
};
