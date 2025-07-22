import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

type Event = {
  _id: string;
  title: string;
  type: string;
  description?: string;
  date: string;
  createdAt: string;
};

type EventsResponse = {
  events: Event[];
};

export const EventsList = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuthStore();
  
  const { data, isLoading, error } = useQuery<EventsResponse, Error>({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        if (!isAuthenticated || !token) {
          throw new Error('Not authenticated');
        }
        
        const response = await apiClient.get('/events');
        console.log('Events API Response:', response);
        // Handle both response formats: { events: [...] } and direct array
        return Array.isArray(response) ? { events: response } : (response as EventsResponse);
      } catch (err) {
        console.error('Error fetching events:', err);
        if ((err as any)?.message === 'Not authenticated') {
          toast.error('Please log in to view events');
          navigate('/login');
        } else {
          toast.error('Failed to load events. Please try again.');
        }
        throw err;
      }
    },
    enabled: isAuthenticated && !!token, // Only run the query if authenticated
    retry: 1,
  });

  const events = data?.events || [];
  console.log('Rendering events:', events);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading events: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button onClick={() => navigate('/teacher/events/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event: Event) => (
          <Card key={event._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <span className="text-sm text-gray-500">
                    {format(new Date(event.date), 'PPP')}
                  </span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {event.type}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {event.description && (
                <p className="text-gray-600">{event.description}</p>
              )}
              <div className="mt-4 text-sm text-gray-500">
                Created on {format(new Date(event.createdAt), 'PPP')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No events found</p>
          <Button onClick={() => navigate('/teacher/events/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first event
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventsList;
