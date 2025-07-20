import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(['users'], async () =>
    apiClient.get<{ users: User[] }>('/users')
  );

  const updateRoleMutation = useMutation(
    async ({ id, role }: { id: string; role: User['role'] }) =>
      apiClient.put(`/users/${id}/role`, { role }),
    {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    }
  );

  const deleteUserMutation = useMutation(
    async (id: string) => apiClient.delete(`/users/${id}`),
    {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    }
  );

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  const users = data?.users ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <select
                      className="border rounded-md px-2 py-1"
                      value={user.role}
                      onChange={(e) =>
                        updateRoleMutation.mutate({
                          id: user.id,
                          role: e.target.value as User['role'],
                        })
                      }
                    >
                      <option value="Admin">Admin</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Parent">Parent</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUserMutation.mutate(user.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="px-4 py-2" colSpan={4}>
                    No users found.
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

export default UserManagement;
