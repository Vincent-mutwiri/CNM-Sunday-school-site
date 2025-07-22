import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Loader2, Trash2, User as UserIcon, X, Users } from 'lucide-react';
import { toast } from 'sonner';

import { apiClient } from '@/utils/api';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        // Users already contain _id from the API
        return { users: response.users };
      } catch (err) {
        console.error('Error in users query:', err);
        toast.error('Failed to load users');
        return { users: [] }; // Return empty array on error
      }
    }
  });

  // Extract users from the response data and sort them by role for better organization
  const users = (data?.users || []).sort((a, b) => {
    const roleOrder: Record<User['role'], number> = {
      'Admin': 0,
      'Teacher': 1,
      'Parent': 2
    };
    return roleOrder[a.role] - roleOrder[b.role];
  });
  console.log('Users in component:', users);

  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: User['role'] }) => {
      if (!id) {
        throw new Error('User ID is required');
      }
      console.log(`Updating user ${id} role to ${role}`);
      try {
        const response = await apiClient.put(`/users/${id}/role`, { role });
        console.log('Update role response:', response);
        return response;
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    onMutate: (variables) => {
      setUpdatingUser(variables.id);
    },
    onSuccess: () => {
      toast.success('User role updated successfully');
      // Invalidate both the admin/users and users queries to ensure UI consistency
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      console.error('Failed to update user role:', error);
      toast.error(`Failed to update user role: ${error.message}`);
    },
    onSettled: () => {
      setUpdatingUser(null);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log(`Deleting user ${userId}`);
      const response = await apiClient.delete(`/users/${userId}`);
      console.log('Delete user response:', response);
      return response;
    },
    onSuccess: () => {
      toast.success('User deleted successfully');
      setUserToDelete(null);
      // Invalidate both the admin/users and users queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
      setUserToDelete(null);
    }
  });

  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<{ name: string; email: string; password: string; role: User['role']; profilePictureUrl?: string }>();

  const createUserMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string; role: User['role'] }) => {
      return apiClient.post('/users', data);
    },
    onSuccess: () => {
      toast.success('User created');
      reset();
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    }
  });

  const bulkUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.uploadFile('/users/bulk', formData);
    },
    onSuccess: () => {
      toast.success('Bulk upload complete');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setCsvFile(null);
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const [csvFile, setCsvFile] = useState<File | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  const handleRoleChange = (user: User, newRole: User['role']) => {
    if (!user._id) {
      console.error('Cannot update role: User ID is undefined', { user });
      toast.error('Cannot update role: Invalid user');
      return;
    }
    
    console.log('Updating user role:', { userId: user._id, newRole });
    updateRoleMutation.mutate({ id: user._id, role: newRole });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
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
              <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
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
                      onValueChange={(value: User['role']) => handleRoleChange(user, value)}
                      disabled={!!updatingUser}
                    >
                      <SelectTrigger className="w-[180px]">
                        {updatingUser === user._id ? (
                          <span className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Updating...
                          </span>
                        ) : (
                          <SelectValue placeholder="Select role" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="admin-role" value="Admin">Admin</SelectItem>
                        <SelectItem key="teacher-role" value="Teacher">Teacher</SelectItem>
                        <SelectItem key="parent-role" value="Parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => setUserToDelete(user._id)}
                      disabled={deleteUserMutation.isPending && deleteUserMutation.variables === user._id}
                    >
                      {deleteUserMutation.isPending && deleteUserMutation.variables === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Delete confirmation */}
                {userToDelete === user._id && (
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
                        onClick={() => handleDeleteUser(user._id)}
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

      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(data => createUserMutation.mutate(data))} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name', { required: true })} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email', { required: true })} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password', { required: true })} />
            </div>
            <div>
              <Label htmlFor="profilePictureUrl">Profile Picture URL</Label>
              <Input id="profilePictureUrl" {...register('profilePictureUrl')} />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(v: User['role']) => {
                register('role').onChange({ target: { value: v } } as any);
              }} defaultValue="Parent">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="Parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create User'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
          <Button
            type="button"
            onClick={() => csvFile && bulkUploadMutation.mutate(csvFile)}
            disabled={!csvFile || bulkUploadMutation.isPending}
          >
            {bulkUploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
