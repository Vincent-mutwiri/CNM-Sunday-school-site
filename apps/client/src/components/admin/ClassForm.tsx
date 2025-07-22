import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { toast } from 'sonner';

const classFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ageRange: z.string().min(1, 'Age range is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  description: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

interface ClassFormProps {
  classData?: {
    _id: string;
    name: string;
    ageRange: string;
    capacity: number;
    description?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ClassForm: React.FC<ClassFormProps> = ({
  classData,
  onSuccess,
  onCancel,
}) => {
  const queryClient = useQueryClient();
  const isEdit = !!classData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: classData || {
      name: '',
      ageRange: '',
      capacity: 10,
      description: '',
    },
  });

  const createClassMutation = useMutation({
    mutationFn: async (data: ClassFormValues) => {
      console.log('Creating class with data:', data);
      const response = await apiClient.post('/classes', data);
      console.log('Class created successfully:', response);
      return response;
    },
    onSuccess: () => {
      console.log('Mutation success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class created successfully');
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Error creating class:', error);
      toast.error(error.message || 'Failed to create class');
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: (data: ClassFormValues) =>
      apiClient.put(`/classes/${classData?._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class updated successfully');
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Error updating class:', error);
      toast.error(error.message || 'Failed to update class');
    },
  });

  const onSubmit = (data: ClassFormValues) => {
    if (isEdit) {
      updateClassMutation.mutate(data);
    } else {
      createClassMutation.mutate(data);
    }
  };

  const isSubmitting = createClassMutation.isPending || updateClassMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Class Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., Sunday School Class A"
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="ageRange">Age Range</Label>
        <Input
          id="ageRange"
          {...register('ageRange')}
          placeholder="e.g., 5-7 years"
        />
        {errors.ageRange && (
          <p className="text-sm text-red-500 mt-1">{errors.ageRange.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="capacity">Capacity</Label>
        <Input
          id="capacity"
          type="number"
          {...register('capacity', { valueAsNumber: true })}
          min={1}
        />
        {errors.capacity && (
          <p className="text-sm text-red-500 mt-1">{errors.capacity.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Class description..."
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving...'
            : isEdit
            ? 'Update Class'
            : 'Create Class'}
        </Button>
      </div>
    </form>
  );
};
