import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Class } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ClassManagement: React.FC = () => {
  const queryClient = useQueryClient();

  type ApiResponse = {
    data: {
      classes: Class[];
    };
  };

  const { data, isLoading } = useQuery<ApiResponse['data']>({
    queryKey: ['classes'],
    queryFn: async (): Promise<ApiResponse['data']> => {
      try {
        const response = await apiClient.get<ApiResponse>('/classes');
        return response?.data || { classes: [] };
      } catch (error) {
        console.error('Error fetching classes:', error);
        return { classes: [] };
      }
    }
  });
  
  const deleteClassMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    }
  });

  if (isLoading) {
    return <div>Loading classes...</div>;
  }

  const classes = data?.classes ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Class Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">
                  Age Range
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">
                  Capacity
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classes.map((cls: Class) => (
                <tr key={cls._id}>
                  <td className="px-4 py-2">{cls.name}</td>
                  <td className="px-4 py-2">{cls.ageRange}</td>
                  <td className="px-4 py-2">{cls.capacity}</td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteClassMutation.mutate(cls._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td className="px-4 py-2" colSpan={4}>
                    No classes found.
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

export default ClassManagement;
