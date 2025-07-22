import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Attendance } from '@/types';

export const useChildAttendance = (childId: string | undefined) => {
  return useQuery({
    queryKey: ['attendance', 'child', childId],
    queryFn: async (): Promise<{ attendance: Attendance[] }> => {
      if (!childId) return { attendance: [] };
      return apiClient.get(`/attendance/child/${childId}`);
    },
    enabled: !!childId,
  });
};
