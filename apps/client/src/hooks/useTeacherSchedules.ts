import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

interface Schedule {
  _id: string;
  class: {
    _id: string;
    name: string;
    ageRange: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  students: Array<{
    _id: string;
    firstName: string;
    lastName: string;
  }>;
}

export function useTeacherSchedules() {
  return useQuery<Schedule[]>({
    queryKey: ['teacherSchedules'],
    queryFn: async () => {
      const { data } = await api.get('/api/schedules/teacher/me');
      return data;
    },
  });
}
