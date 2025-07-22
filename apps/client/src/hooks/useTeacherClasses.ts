import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Class } from '@/types';

export interface TeacherClass extends Class {
  students: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    attendanceStatus?: 'Present' | 'Absent' | 'Late';
  }>;
  schedule: {
    _id: string;
    date: string;
  };
}

export const useTeacherClasses = () => {
  return useQuery<{ classes: TeacherClass[] }>({
    queryKey: ['teacher', 'classes'],
    queryFn: async () => {
      try {
        return await apiClient.get('/teacher/classes');
      } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
          console.warn('Teacher classes endpoint not found. The backend might not be running or the endpoint is not implemented.');
          return { classes: [] }; // Return empty array instead of failing
        }
        throw error; // Re-throw other errors
      }
    },
    retry: 1, // Only retry once on failure
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      classId: string;
      studentId: string;
      status: 'Present' | 'Absent' | 'Late';
      notes?: string;
    }) => apiClient.post('/attendance/mark', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'classes'] });
    },
  });
};
