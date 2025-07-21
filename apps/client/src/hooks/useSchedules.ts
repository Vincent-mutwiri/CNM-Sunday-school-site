import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Schedule } from '@/types';

export const useTeacherSchedules = () => {
  const query = useQuery({
    queryKey: ['teacher', 'schedules'],
    queryFn: async (): Promise<{ schedules: Schedule[] }> =>
      apiClient.get('/schedules/teacher/me'),
  });

  return {
    schedules: query.data?.schedules ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
