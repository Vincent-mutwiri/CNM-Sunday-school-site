import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';

export interface MarkAttendanceInput {
  childId: string;
  scheduleId: string;
  status: 'Present' | 'Absent' | 'Late';
  notes?: string;
}

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: MarkAttendanceInput) => 
      apiClient.post('/attendance/mark', data),
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};
