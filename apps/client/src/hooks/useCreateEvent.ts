import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api';
import { Event } from '../types';

interface CreateEventInput {
  title: string;
  type: 'Announcement' | 'Event' | 'Birthday' | 'Memory Verse';
  description?: string;
  date: string;
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Event, Error, CreateEventInput>({
    mutationFn: async (eventData) => {
      const response = await apiClient.post('/events', eventData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the events query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
