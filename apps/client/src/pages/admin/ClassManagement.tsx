import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Class, User, Child } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

  type UsersResponse = {
    users: User[];
  };

  const { data: usersData } = useQuery<UsersResponse>({
    queryKey: ['admin', 'users'],
    queryFn: async () => apiClient.get<UsersResponse>('/users'),
  });

  const parents = (usersData?.users || []).filter(u => u.role === 'Parent');
  const childrenOptions = parents.flatMap(parent =>
    (parent.children as Child[] | undefined)?.map(child => ({
      id: child._id,
      label: `${parent.name} - ${child.firstName} ${child.lastName}`,
    })) || []
  );

  const [selectedChild, setSelectedChild] = useState<Record<string, string>>({});

  const deleteClassMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    }
  });

  const assignChildMutation = useMutation({
    mutationFn: ({ classId, childId }: { classId: string; childId: string }) =>
      apiClient.post(`/classes/${classId}/assign-student`, { childId }),
    onSuccess: () => {
      toast.success('Child assigned to class');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setSelectedChild(prev => ({ ...prev }));
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign child');
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
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">
                  Assign Child
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
                  <td className="px-4 py-2">
                    <select
                      className="border rounded p-1"
                      value={selectedChild[cls._id] || ''}
                      onChange={(e) =>
                        setSelectedChild(prev => ({ ...prev, [cls._id]: e.target.value }))
                      }
                    >
                      <option value="">Select child</option>
                      {childrenOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      className="ml-2"
                      onClick={() =>
                        selectedChild[cls._id] &&
                        assignChildMutation.mutate({
                          classId: cls._id,
                          childId: selectedChild[cls._id],
                        })
                      }
                      disabled={!selectedChild[cls._id] || assignChildMutation.isPending}
                    >
                      Assign
                    </Button>
                  </td>
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
                  <td className="px-4 py-2" colSpan={5}>
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
