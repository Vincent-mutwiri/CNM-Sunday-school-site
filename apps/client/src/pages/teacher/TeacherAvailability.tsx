import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export const TeacherAvailability: React.FC = () => {
  const { register, handleSubmit, setValue } = useForm<{availability: string[]}>();

  const { data } = useQuery<{ user: { availability: string[] } }>({
    queryKey: ['me','availability'],
    queryFn: () => apiClient.get('/users/me'),
  });

  useEffect(() => {
    if(data?.user?.availability){
      setValue('availability', data.user.availability);
    }
  }, [data, setValue]);

  const mutation = useMutation({
    mutationFn: (values: {availability: string[]}) => apiClient.put('/users/me/availability', values),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-2">
          {days.map(day => (
            <label key={day} className="flex items-center space-x-2">
              <Checkbox value={day} {...register('availability')} />
              <span>{day}</span>
            </label>
          ))}
          <Button type="submit" disabled={mutation.isPending}>Save</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherAvailability;
