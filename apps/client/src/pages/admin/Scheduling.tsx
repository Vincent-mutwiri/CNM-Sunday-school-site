import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Class, Schedule, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ScheduleFormData {
  classId: string;
  teacherId: string;
  date: string;
}

const Scheduling: React.FC = () => {
  type ApiResponse = {
    data: {
      schedules: Schedule[];
    };
  };

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ApiResponse['data']>({
    queryKey: ['schedules'],
    queryFn: async (): Promise<ApiResponse['data']> => {
      try {
        const response = await apiClient.get<ApiResponse>('/schedules');
        return response?.data || { schedules: [] };
      } catch (error) {
        console.error('Error fetching schedules:', error);
        return { schedules: [] };
      }
    }
  });

  const { data: classData } = useQuery<{ data: { classes: Class[] } }>({
    queryKey: ['classes'],
    queryFn: async () => {
      try {
        return await apiClient.get('/classes');
      } catch (error) {
        console.error('Error fetching classes:', error);
        return { data: { classes: [] } };
      }
    }
  });

  const { data: userData } = useQuery<{ data: { users: User[] } }>({
    queryKey: ['teachers'],
    queryFn: async () => {
      try {
        return await apiClient.get('/users');
      } catch (error) {
        console.error('Error fetching users:', error);
        return { data: { users: [] } };
      }
    }
  });

  const classes = classData?.data.classes ?? [];
  const teachers = (userData?.data.users ?? []).filter(u => u.role === 'Teacher');

  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const { register, handleSubmit, setValue, reset, watch } = useForm<ScheduleFormData>({
    defaultValues: { classId: '', teacherId: '', date: '' }
  });
  const selectedClass = watch('classId');
  const selectedTeacher = watch('teacherId');

  useEffect(() => {
    if (editingSchedule) {
      const cls = typeof editingSchedule.class === 'string'
        ? editingSchedule.class
        : (editingSchedule.class as Class)._id;
      const teacher = typeof editingSchedule.teacher === 'string'
        ? editingSchedule.teacher
        : (editingSchedule.teacher as User)._id;
      reset({
        classId: cls,
        teacherId: teacher,
        date: editingSchedule.date.slice(0, 16)
      });
    } else {
      reset({ classId: '', teacherId: '', date: '' });
    }
  }, [editingSchedule, reset]);

  const createSchedule = useMutation({
    mutationFn: (data: ScheduleFormData) =>
      apiClient.post('/schedules', {
        classId: data.classId,
        teacherId: data.teacherId,
        date: new Date(data.date).toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      reset({ classId: '', teacherId: '', date: '' });
    }
  });

  const updateSchedule = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ScheduleFormData }) =>
      apiClient.put(`/schedules/${id}`, {
        classId: data.classId,
        teacherId: data.teacherId,
        date: new Date(data.date).toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setEditingSchedule(null);
      reset({ classId: '', teacherId: '', date: '' });
    }
  });

  const deleteSchedule = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    }
  });

  const onSubmit = (formData: ScheduleFormData) => {
    if (editingSchedule) {
      updateSchedule.mutate({ id: editingSchedule._id, data: formData });
    } else {
      createSchedule.mutate(formData);
    }
  };

  if (isLoading) {
    return <div>Loading schedules...</div>;
  }

  const schedules = data?.schedules ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Scheduling</h1>
      <Card>
        <CardHeader>
          <CardTitle>{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="class">Class</Label>
              <Select
                value={selectedClass}
                onValueChange={(val) => setValue('classId', val)}
              >
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register('classId')} />
            </div>
            <div>
              <Label htmlFor="teacher">Teacher</Label>
              <Select
                value={selectedTeacher}
                onValueChange={(val) => setValue('teacherId', val)}
              >
                <SelectTrigger id="teacher">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register('teacherId')} />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input type="datetime-local" id="date" {...register('date', { required: true })} />
            </div>
            <div className="flex space-x-2 pt-2">
              {editingSchedule && (
                <Button type="button" variant="outline" onClick={() => setEditingSchedule(null)}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={createSchedule.isPending || updateSchedule.isPending}>
                {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Schedules</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">
                  Class
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">
                  Teacher
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule._id}>
                  <td className="px-4 py-2">{(schedule.class as any).name}</td>
                  <td className="px-4 py-2">{(schedule.teacher as any).name}</td>
                  <td className="px-4 py-2">
                    {new Date(schedule.date).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingSchedule(schedule)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteSchedule.mutate(schedule._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td className="px-4 py-2" colSpan={4}>
                    No schedules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Scheduling;
