import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { User, Class, Resource, Event, Child, Schedule, Grade } from '@/types';

export const useAdminStats = () => {
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async (): Promise<{ users: User[] }> => apiClient.get('/users'),
  });

  const classesQuery = useQuery({
    queryKey: ['admin', 'classes'],
    queryFn: async (): Promise<{ classes: Class[] }> => apiClient.get('/classes'),
  });

  const pendingResourcesQuery = useQuery({
    queryKey: ['admin', 'pending-resources'],
    queryFn: async (): Promise<{ resources: Resource[] }> => apiClient.get('/resources/pending'),
  });

  const eventsQuery = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: async (): Promise<{ events: Event[] }> => apiClient.get('/events'),
  });

  return {
    users: usersQuery.data?.users ?? [],
    classes: classesQuery.data?.classes ?? [],
    pendingResources: pendingResourcesQuery.data?.resources ?? [],
    events: eventsQuery.data?.events ?? [],
    isLoading:
      usersQuery.isLoading ||
      classesQuery.isLoading ||
      pendingResourcesQuery.isLoading ||
      eventsQuery.isLoading,
  };
};

export const useParentDashboard = () => {
  const dashboardQuery = useQuery({
    queryKey: ['parent', 'dashboard'],
    queryFn: async (): Promise<{
      children: Child[];
      upcomingSchedules: Schedule[];
      recentAttendance: any[];
      recentGrades: Grade[];
    }> => apiClient.get('/dashboard/parent'),
  });

  return {
    children: dashboardQuery.data?.children ?? [],
    upcomingSchedules: dashboardQuery.data?.upcomingSchedules ?? [],
    recentAttendance: dashboardQuery.data?.recentAttendance ?? [],
    recentGrades: dashboardQuery.data?.recentGrades ?? [],
    isLoading: dashboardQuery.isLoading,
  };
};

export const useTeacherDashboard = () => {
  const dashboardQuery = useQuery({
    queryKey: ['teacher', 'dashboard'],
    queryFn: async (): Promise<{
      classes: Class[];
      upcomingSchedules: Schedule[];
      recentGrades: Grade[];
    }> => apiClient.get('/dashboard/teacher'),
  });

  return {
    classes: dashboardQuery.data?.classes ?? [],
    upcomingSchedules: dashboardQuery.data?.upcomingSchedules ?? [],
    recentGrades: dashboardQuery.data?.recentGrades ?? [],
    isLoading: dashboardQuery.isLoading,
  };
};
