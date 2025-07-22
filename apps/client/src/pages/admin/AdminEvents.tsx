import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiClient } from '@/utils/api';
import { Event } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const eventTypes = ['Announcement', 'Event', 'Birthday', 'Memory Verse'] as const;
type EventType = typeof eventTypes[number];

interface EventForm {
  title: string;
  type: EventType;
  date: string;
  description: string;
}

const emptyForm: EventForm = {
  title: '',
  type: 'Event',
  date: '',
  description: ''
};

const AdminEvents: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ events: Event[] }>({
    queryKey: ['admin', 'events'],
    queryFn: () => apiClient.get<{ events: Event[] }>('/events'),
  });

  const createMutation = useMutation({
    mutationFn: async (newData: EventForm) => {
      await apiClient.post('/events', { ...newData, date: new Date(newData.date).toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      setForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EventForm }) => {
      await apiClient.put(`/events/${id}`, { ...data, date: new Date(data.date).toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      setEditingId(null);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const events = data?.events ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Event Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Event' : 'Create Event'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val as EventType })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <Textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              {editingId && (
                <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {isLoading ? (
            <p className="p-4">Loading events...</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event._id}>
                    <td className="px-4 py-2">{event.title}</td>
                    <td className="px-4 py-2">{event.type}</td>
                    <td className="px-4 py-2">{format(new Date(event.date), 'PPP')}</td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingId(event._id);
                        setForm({
                          title: event.title,
                          type: event.type as EventType,
                          date: event.date.substring(0, 10),
                          description: event.description || '',
                        });
                      }}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(event._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td className="px-4 py-2" colSpan={4}>No events found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEvents;
