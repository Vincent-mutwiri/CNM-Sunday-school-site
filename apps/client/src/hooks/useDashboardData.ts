import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { User, Class, Resource, Event, Child, Schedule } from '@/types';

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
  const childrenQuery = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: async (): Promise<{ children: Child[] }> =>
      apiClient.get('/children/my-children'),
  });

  const eventsQuery = useQuery({
    queryKey: ['parent', 'events'],
    queryFn: async (): Promise<{ events: Event[] }> => apiClient.get('/events'),
  });

  return {
    children: childrenQuery.data?.children ?? [],
    events: eventsQuery.data?.events ?? [],
    isLoading: childrenQuery.isLoading || eventsQuery.isLoading,
  };
};

export const useTeacherDashboard = () => {
  const schedulesQuery = useQuery({
    queryKey: ['teacher', 'schedules'],
    queryFn: async (): Promise<{ schedules: Schedule[] }> =>
      apiClient.get('/schedules/teacher/me'),
  });

  const eventsQuery = useQuery({
    queryKey: ['teacher', 'events'],
    queryFn: async (): Promise<{ events: Event[] }> => apiClient.get('/events'),
  });

  const resourcesQuery = useQuery({
    queryKey: ['teacher', 'resources'],
    queryFn: async (): Promise<{ resources: Resource[] }> => apiClient.get('/resources'),
  });

  return {
    schedules: schedulesQuery.data?.schedules ?? [],
    events: eventsQuery.data?.events ?? [],
    resources: resourcesQuery.data?.resources ?? [],
    isLoading:
      schedulesQuery.isLoading || eventsQuery.isLoading || resourcesQuery.isLoading,
  };
};
