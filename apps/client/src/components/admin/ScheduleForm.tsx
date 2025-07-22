import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { toast } from 'sonner';
import { Class, User } from '@/types';

const scheduleFormSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  date: z.string().min(1, 'Date is required'),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleFormProps {
  scheduleData?: {
    _id: string;
    class: string | Class;
    teacher: string | User;
    date: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  scheduleData,
  onSuccess,
  onCancel,
}) => {
  const queryClient = useQueryClient();
  const isEdit = !!scheduleData;

  const { data: classesData } = useQuery<{ classes: Class[] }>({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await apiClient.get<{ classes: Class[] }>('/classes');
      return response || { classes: [] };
    },
  });

  // Define the Teacher type with required fields
  type Teacher = User & { _id: string; name: string };

  // Fetch teachers from the API
  const { data: teachersData, error: teachersError } = useQuery<{ users: Teacher[] }>({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await apiClient.get<{ users: Teacher[] }>('/users/teachers');
      return response || { users: [] };
    },
    retry: 1, // Only retry once if it fails
  });

  const classes = classesData?.classes || [];
  const teachers = teachersData?.users || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: scheduleData
      ? {
          classId: typeof scheduleData.class === 'string' ? scheduleData.class : scheduleData.class._id,
          teacherId: typeof scheduleData.teacher === 'string' ? scheduleData.teacher : scheduleData.teacher._id,
          date: new Date(scheduleData.date).toISOString().slice(0, 16),
        }
      : {
          classId: '',
          teacherId: '',
          date: '',
        },
  });

  const createScheduleMutation = useMutation({
    mutationFn: (data: ScheduleFormValues) =>
      apiClient.post('/schedules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule created successfully');
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Error creating schedule:', error);
      toast.error(error.message || 'Failed to create schedule');
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: (data: ScheduleFormValues) =>
      apiClient.put(`/schedules/${scheduleData?._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule updated successfully');
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Error updating schedule:', error);
      toast.error(error.message || 'Failed to update schedule');
    },
  });

  const onSubmit = (data: ScheduleFormValues) => {
    if (isEdit) {
      updateScheduleMutation.mutate(data);
    } else {
      createScheduleMutation.mutate(data);
    }
  };

  const isSubmitting = createScheduleMutation.isPending || updateScheduleMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="classId">Class</Label>
        <select
          id="classId"
          className="w-full p-2 border rounded"
          disabled={isSubmitting}
          {...register('classId')}
        >
          <option value="">Select a class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>
        {errors.classId && (
          <p className="text-sm text-red-500">{errors.classId.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="teacherId">Teacher</Label>
        <select
          id="teacherId"
          className="w-full p-2 border rounded"
          disabled={isSubmitting}
          {...register('teacherId')}
        >
          <option value="">Select a teacher</option>
          {teachers.length > 0 ? (
            teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              {teachersError ? 'Failed to load teachers' : 'No teachers available'}
            </option>
          )}
        </select>
        {errors.teacherId && (
          <p className="text-sm text-red-500">{errors.teacherId.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="date">Date and Time</Label>
        <Input
          id="date"
          type="datetime-local"
          disabled={isSubmitting}
          {...register('date')}
        />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'} Schedule
        </Button>
      </div>
    </form>
  );
};
