import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil } from 'lucide-react';

// UTILS & TYPES (Assuming these are in your project)
import { apiClient } from '@/utils/api';

// Types
type UserRole = 'Admin' | 'Teacher' | 'Parent';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePictureUrl?: string;
  phoneNumber?: string;
}

interface Class {
  _id: string;
  name: string;
  ageRange: string;
  capacity: number;
  description?: string;
  teacher?: string | User | null;
  students?: string[] | User[];
  createdAt?: string;
  updatedAt?: string;
}

// SHADCN/UI COMPONENTS
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// =================================================================
// 1. ZOD SCHEMA & TYPES
// =================================================================

const classFormSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  ageRange: z.string().min(1, 'Age range is required'),
  // The transform ensures the final data is a number, making the form flexible.
  capacity: z.preprocess(
    (val) => (val === '' ? undefined : parseInt(String(val), 10)),
    z.number({ invalid_type_error: 'Capacity must be a number' }).positive('Capacity must be a positive number')
  ),
  description: z.string().optional(),
  teacher: z.string().optional().nullable(), // The teacher ID, can be an empty string or null
});

type ClassFormData = z.infer<typeof classFormSchema>;

// Teacher type that matches the API response
interface Teacher {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string; // Allow any string for flexibility
  profilePictureUrl?: string;
  phoneNumber?: string;
}

type SaveClassData = {
  name: string;
  ageRange: string;
  capacity: number;
  description?: string;
  teacher?: string | null;
};


// =================================================================
// 2. HELPER COMPONENT: DeleteConfirmationDialog
// =================================================================

type DeleteConfirmationDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
};

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isPending,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <p className="text-sm text-gray-500">
            This action cannot be undone. This will permanently delete the class.
          </p>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


// =================================================================
// 3. HELPER COMPONENT: ClassFormDialog
// =================================================================

type ClassFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: Class | null;
  teachers: User[];
};

const ClassFormDialog: React.FC<ClassFormDialogProps> = ({ isOpen, onOpenChange, classData, teachers }) => {
  const queryClient = useQueryClient();
  const isEditMode = !!classData;

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema) as any,
    defaultValues: {
      name: '',
      ageRange: '',
      capacity: 20,
      description: '',
      teacher: '',
    },
  });

  useEffect(() => {
    if (isEditMode && classData) {
      const teacherId = classData.teacher && typeof classData.teacher === 'object'
        ? classData.teacher._id
        : classData.teacher;

      form.reset({
        name: classData.name,
        ageRange: classData.ageRange,
        capacity: classData.capacity,
        description: classData.description || '',
        teacher: teacherId || '',
      });
    } else {
      form.reset({
        name: '',
        ageRange: '',
        capacity: 20,
        description: '',
        teacher: '',
      });
    }
  }, [classData, isEditMode, form]);

  const { mutate: saveClass, isPending: isSaving } = useMutation({
    mutationFn: async (data: ClassFormData) => {
      const payload: SaveClassData = {
        name: data.name,
        ageRange: data.ageRange,
        capacity: Number(data.capacity),
        description: data.description,
        teacher: data.teacher || null,
      };
      
      if (isEditMode && classData?._id) {
        return apiClient.put(`/classes/${classData._id}`, payload);
      }
      return apiClient.post('/classes', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success(isEditMode ? 'Class updated successfully' : 'Class created successfully');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save class.');
    },
  });

  const onSubmit: SubmitHandler<ClassFormData> = (data) => {
    saveClass(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Class' : 'Create New Class'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Class Name</FormLabel>
                <FormControl><Input placeholder="e.g. Beginners" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ageRange" render={({ field }) => (
              <FormItem>
                <FormLabel>Age Range</FormLabel>
                <FormControl><Input placeholder="e.g. 3-5" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="capacity" render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl><Input type="number" min="1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="teacher" render={({ field }) => (
              <FormItem>
                <FormLabel>Teacher (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl><Textarea placeholder="Briefly describe the class curriculum" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? 'Saving...' : isEditMode ? 'Update Class' : 'Create Class'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


// =================================================================
// 4. HELPER COMPONENT: ClassTable
// =================================================================

type ClassTableProps = {
  classes: Class[];
  teachers: User[];
  onEdit: (cls: Class) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  isLoading: boolean;
};

const ClassTable: React.FC<ClassTableProps> = ({ classes, teachers, onEdit, onDelete, onArchive, isLoading }) => {
  const getTeacherName = (teacher: string | Teacher | User | null | undefined) => {
    if (!teacher) return <span className="text-gray-500">Unassigned</span>;
    if (typeof teacher === 'object' && 'name' in teacher) return teacher.name;
    if (typeof teacher === 'string') {
      const foundTeacher = teachers.find((t) => t._id === teacher);
      return foundTeacher ? foundTeacher.name : 'Unknown Teacher';
    }
    return 'Unknown Teacher';
  };

  if (isLoading) {
    return <div>Loading classes...</div>; // Or a skeleton loader
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Age Range</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Capacity</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Teacher</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Description</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {classes.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                No classes found.
              </td>
            </tr>
          ) : (
            classes.map((cls) => (
              <tr key={cls._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{cls.name}</td>
                <td className="px-4 py-3 text-gray-700">{cls.ageRange}</td>
                <td className="px-4 py-3 text-gray-700">{cls.capacity}</td>
                <td className="px-4 py-3 text-gray-700">{getTeacherName(cls.teacher)}</td>
                <td className="px-4 py-3 text-gray-700">
                  <p className="line-clamp-2">{cls.description || 'N/A'}</p>
                </td>
                <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  <Button variant="outline" size="sm" onClick={() => onEdit(cls)}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onArchive(cls._id)}>
                    Archive
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(cls._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};


// =================================================================
// 5. MAIN COMPONENT: ClassManagement
// =================================================================

const ClassManagement: React.FC = () => {
  const queryClient = useQueryClient();

  const [dialogState, setDialogState] = useState<{ open: boolean; classData?: Class | null }>({ open: false });
  const [deleteDialogState, setDeleteDialogState] = useState<{ open: boolean; classId?: string }>({ open: false });
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');

  const { data: classes = [], isLoading, isError, error } = useQuery<Class[]>({
    queryKey: ['classes'],
    queryFn: async (): Promise<Class[]> => {
      const response = await apiClient.get<{ classes: Class[] }>('/classes');
      return response.classes || [];
    },
  });



  const { data: teachers = [] } = useQuery<User[]>({
    queryKey: ['teachers'],
    queryFn: async (): Promise<User[]> => {
      const response = await apiClient.get<{ users: User[] }>('/users/teachers');
      return response.users || [];
    },
  });

  const filteredClasses = useMemo(() => {
    if (!Array.isArray(classes)) return [];
    if (selectedTeacher === 'all') return classes;
    return classes.filter(cls => {
      if (!cls?.teacher) return false;
      const teacherId = typeof cls.teacher === 'string' ? cls.teacher : cls.teacher._id;
      return teacherId === selectedTeacher;
    });
  }, [classes, selectedTeacher]);

  const { mutate: deleteClass, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class deleted successfully');
      setDeleteDialogState({ open: false });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete class.');
    },
  });

  const { mutate: archiveClass, isPending: isArchiving } = useMutation({
    mutationFn: (id: string) => apiClient.put(`/classes/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class archived');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to archive class.')
  });

  const handleOpenCreate = () => setDialogState({ open: true, classData: null });
  const handleOpenEdit = (cls: Class) => setDialogState({ open: true, classData: cls });
  const handleDeleteRequest = (id: string) => setDeleteDialogState({ open: true, classId: id });
  const handleConfirmDelete = () => {
    if (deleteDialogState.classId) {
      deleteClass(deleteDialogState.classId);
    }
  };
  const handleArchive = (id: string) => archiveClass(id);

  if (isError) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-md">Error loading classes: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Class Management</h1>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Class
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Classes</CardTitle>
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teachers</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ClassTable
            classes={filteredClasses}
            teachers={teachers}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteRequest}
            onArchive={handleArchive}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <ClassFormDialog
        isOpen={dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        classData={dialogState.classData}
        teachers={teachers}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogState.open}
        onOpenChange={(open) => setDeleteDialogState({ ...deleteDialogState, open })}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </div>
  );
};

export default ClassManagement;