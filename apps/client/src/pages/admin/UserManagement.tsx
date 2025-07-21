import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, Trash2, User as UserIcon, X, Users } from 'lucide-react';
import { toast } from 'sonner';

import { apiClient } from '@/utils/api';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the API response type
type UsersResponse = {
  users: User[];
};

const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      try {
        console.log('Fetching users from /users endpoint...');
        const response = await apiClient.get<UsersResponse>('/users');
        console.log('Users API response:', response);
        return response;
      } catch (err) {
        console.error('Error in users query:', err);
        toast.error('Failed to load users');
        return { users: [] }; // Return empty array on error
      }
    }
  });

  // Extract users from the response data
  const users = data?.users || [];
  console.log('Users in component:', users);

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: User['role'] }) => {
      await apiClient.put(`/users/${id}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => {
      return apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    updateRoleMutation.mutate(
      { id: userId, role: newRole },
      {
        onSuccess: () => {
          toast.success('User role updated successfully');
        },
        onError: () => {
          toast.error('Failed to update user role');
        }
      }
    );
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId, {
      onSuccess: () => {
        toast.success('User deleted successfully');
        setUserToDelete(null);
      },
      onError: () => {
        toast.error('Failed to delete user');
        setUserToDelete(null);
      }
    });
  };

  // Role colors mapping (commented out for now, can be used for styling)
  // const roleColors = {
  //   Admin: 'bg-purple-100 text-purple-800',
  //   Teacher: 'bg-blue-100 text-blue-800',
  //   Parent: 'bg-green-100 text-green-800'
  // };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <span className="text-sm text-gray-500">
          {users.length} user{users.length !== 1 ? 's' : ''} total
        </span>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {user.profilePictureUrl ? (
                        <img 
                          src={user.profilePictureUrl} 
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Select
                      value={user.role}
                      onValueChange={(value: User['role']) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setUserToDelete(user.id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      {deleteUserMutation.isPending && userToDelete === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Delete confirmation */}
                {userToDelete === user.id && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md flex items-center justify-between">
                    <span className="text-sm text-red-700">
                      Are you sure you want to delete this user?
                    </span>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserToDelete(null)}
                        disabled={deleteUserMutation.isPending}
                      >
                        <X className="h-3 w-3 mr-1" /> Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteUserMutation.isPending}
                      >
                        {deleteUserMutation.isPending ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 mr-1" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
