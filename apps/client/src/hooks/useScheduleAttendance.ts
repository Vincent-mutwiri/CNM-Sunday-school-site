import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Attendance, Schedule } from '@/types';

export const useScheduleAttendance = (scheduleId: string | undefined) => {
  return useQuery<{ schedule: Schedule; attendanceRecords: Attendance[] }>({
    queryKey: ['attendance', 'schedule', scheduleId],
    queryFn: async () => {
      if (!scheduleId) throw new Error('scheduleId required');
      return apiClient.get(`/attendance/schedule/${scheduleId}`);
    },
    enabled: !!scheduleId,
  });
};
