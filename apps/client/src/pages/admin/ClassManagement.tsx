import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Class, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm, SubmitHandler, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// Import form components from shadcn/ui
import { 
  Form as ShadcnForm,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Create a custom Form component that extends the Shadcn Form with proper typing
const Form = ShadcnForm;

// Extend the Class type to include the teacher property
type ClassWithTeacher = Omit<Class, 'teacher'> & {
  teacher?: string | { id: string; name: string };
  _id?: string;
};

const classFormSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  ageRange: z.string().min(1, 'Age range is required'),
  capacity: z.union([z.string(), z.number()])
    .transform(val => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine(val => !isNaN(val) && val > 0, {
      message: 'Capacity must be a positive number',
    }),
  description: z.string().optional(),
  teacher: z.string().optional(),
});

const ClassManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassWithTeacher | null>(null);

  type ApiResponse = {
    classes: ClassWithTeacher[];
  };

  // Fetch classes
  const { data: classesData, isLoading } = useQuery<ApiResponse>({
    queryKey: ['classes'],
    queryFn: async (): Promise<ApiResponse> => {
      try {
        const response = await apiClient.get<ApiResponse>('/classes');
        return response || { classes: [] };
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
        return { classes: [] };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Fetch teachers for the dropdown and mapping
  const { data: teachersData } = useQuery<User[]>({
    queryKey: ['teachers'],
    queryFn: async (): Promise<User[]> => {
      const response = await apiClient.get<{ users: User[] }>('/users/teachers');
      return response.users || [];
    },
  });

  const classes = classesData?.classes || [];

  // Mutation for deleting a class
  const deleteClassMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class deleted successfully');
    },
  });

  const handleEditClass = (cls: ClassWithTeacher) => {
    // Ensure the teacher is properly formatted for the form
    const teacherValue = cls.teacher 
      ? (typeof cls.teacher === 'object' ? cls.teacher.id : cls.teacher)
      : '';
      
    setEditingClass({
      ...cls,
      teacher: teacherValue
    });
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingClass(null);
    form.reset({
      name: '',
      ageRange: '',
      capacity: '',
      description: '',
      teacher: '',
    });
    setIsCreateDialogOpen(false);
  };

  type ClassFormData = {
    name: string;
    ageRange: string;
    capacity: string | number;
    description?: string;
    teacher?: string;
  };

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      ageRange: '',
      capacity: '20',
      description: '',
      teacher: '',
    },
  });

  // Define field types for form fields
  // Helper type for form field props
  type FieldProps<T extends keyof ClassFormData> = {
    field: ControllerRenderProps<ClassFormData, T>;
  };

  // Update form when editingClass changes
  useEffect(() => {
    if (editingClass) {
      const teacherValue = editingClass.teacher 
        ? (typeof editingClass.teacher === 'object' ? editingClass.teacher.id : editingClass.teacher)
        : '';

      form.reset({
        name: editingClass.name,
        ageRange: editingClass.ageRange,
        capacity: editingClass.capacity.toString(),
        description: editingClass.description || '',
        teacher: teacherValue,
      });
    } else {
      form.reset({
        name: '',
        ageRange: '',
        capacity: '20',
        description: '',
        teacher: '',
      });
    }
  }, [editingClass, form]);

  const createOrUpdateClass = useMutation({
    mutationFn: async (data: ClassFormData) => {
      const payload = {
        ...data,
      };
      
      if (editingClass?._id) {
        return apiClient.put(`/classes/${editingClass._id}`, payload);
      }
      return apiClient.post('/classes', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success(editingClass ? 'Class updated successfully' : 'Class created successfully');
      handleCloseDialog();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save class';
      toast.error(errorMessage);
    },
  });

  const onSubmit: SubmitHandler<ClassFormData> = (data) => {
    createOrUpdateClass.mutate(data);
  };



  if (isLoading) {
    return <div>Loading classes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Class Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Class
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase w-1/6">
                  Name
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase w-1/6">
                  Age Range
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase w-1/12">
                  Capacity
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase w-1/3">
                  Description
                </th>
                <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase w-1/6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classes.map((cls) => (
                <tr key={cls._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{cls.name}</td>
                  <td className="px-4 py-2">{cls.ageRange}</td>
                  <td className="px-4 py-2">{cls.capacity}</td>
                  <td className="px-4 py-2">
                    <div className="line-clamp-2 text-sm text-gray-600">
                      {cls.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClass(cls)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this class?')) {
                          deleteClassMutation.mutate(cls._id);
                        }
                      }}
                      disabled={deleteClassMutation.isPending}
                    >
                      {deleteClassMutation.isPending ? 'Deleting...' : 'Delete'}
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

      {/* Create/Edit Class Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: FieldProps<'name'>) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter class name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ageRange"
                render={({ field }: FieldProps<'ageRange'>) => (
                  <FormItem>
                    <FormLabel>Age Range</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 5-7 years" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }: FieldProps<'capacity'>) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teacher"
                render={({ field }: FieldProps<'teacher'>) => {
                  // Ensure the value is always a string for the Select component
                  const value = field.value?.toString() || '';
                  
                  return (
                    <FormItem>
                      <FormLabel>Teacher (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={value}
                        defaultValue={value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a teacher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No teacher assigned</SelectItem>
                          {teachersData?.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }: FieldProps<'description'>) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter class description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseDialog}
                  disabled={createOrUpdateClass.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createOrUpdateClass.isPending}>
                  {createOrUpdateClass.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default ClassManagement;
