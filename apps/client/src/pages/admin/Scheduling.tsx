
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

// UTILS & TYPES (Assuming these are in your project)
import { apiClient } from '@/utils/api'; 
import { Schedule, Class, User } from '@/types'; 

// SHADCN/UI COMPONENTS
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// =================================================================
// 1. ZOD SCHEMA & TYPES
// =================================================================

const scheduleFormSchema = z.object({
  classId: z.string().min(1, 'A class must be selected.'),
  teacherId: z.string().min(1, 'A teacher must be selected.'),
  date: z.string().min(1, 'A date and time must be selected.'),
  room: z.string().min(1, 'Room is required'),
  recurrence: z.object({
    frequency: z.enum(['none','daily','weekly','monthly']),
    interval: z.coerce.number().min(1).default(1),
    count: z.coerce.number().optional(),
  }).optional(),
});

type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

// Extend the base Schedule type to ensure nested objects are populated
type PopulatedSchedule = Schedule & {
  class: Class;
  teacher: User;
};

// =================================================================
// 2. HELPER COMPONENT: DeleteConfirmationDialog (Reusable)
// =================================================================

type DeleteConfirmationDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
};

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({ isOpen, onOpenChange, onConfirm, isPending }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <p className="text-sm text-gray-500">
          This action cannot be undone. This will permanently delete the schedule entry.
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


// =================================================================
// 3. HELPER COMPONENT: ScheduleFormDialog
// =================================================================

type ScheduleFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleData?: Schedule | null;
  classes: Class[];
  teachers: User[];
};

const ScheduleFormDialog: React.FC<ScheduleFormDialogProps> = ({ isOpen, onOpenChange, scheduleData, classes, teachers }) => {
  const queryClient = useQueryClient();
  const isEditMode = !!scheduleData;

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: { classId: '', teacherId: '', date: '', room: '', recurrence: { frequency: 'none', interval: 1 } },
  });

  const watchDate = form.watch('date');
  const availableTeachers = React.useMemo(() => {
    if (!watchDate) return teachers;
    const dayName = new Date(watchDate).toLocaleDateString('en-US', { weekday: 'long' });
    return teachers.filter(t => Array.isArray(t.availability) ? t.availability.includes(dayName) : true);
  }, [watchDate, teachers]);

  useEffect(() => {
    if (isEditMode && scheduleData) {
      // The backend sends a full ISO string, but datetime-local input needs `YYYY-MM-DDTHH:mm`
      const formattedDate = scheduleData.date ? new Date(scheduleData.date).toISOString().slice(0, 16) : '';
      form.reset({
        classId: typeof scheduleData.class === 'string' ? scheduleData.class : scheduleData.class?._id || '',
        teacherId: typeof scheduleData.teacher === 'string' ? scheduleData.teacher : scheduleData.teacher?._id || '',
        date: formattedDate,
        room: scheduleData.room || '',
        recurrence: scheduleData.recurrence ? { frequency: scheduleData.recurrence.frequency, interval: scheduleData.recurrence.interval, count: scheduleData.recurrence.count } : { frequency: 'none', interval: 1 },
      });
    } else {
      form.reset({ classId: '', teacherId: '', date: '', room: '', recurrence: { frequency: 'none', interval: 1 } });
    }
  }, [scheduleData, isEditMode, form]);

  const { mutate: saveSchedule, isPending } = useMutation({
    mutationFn: (data: ScheduleFormData) => {
      // Convert local datetime string back to ISO string for the backend
      const payload: any = { ...data, date: new Date(data.date).toISOString() };
      if (payload.recurrence && payload.recurrence.frequency === 'none') {
        delete payload.recurrence;
      }
      if (isEditMode && scheduleData?._id) {
        return apiClient.put(`/schedules/${scheduleData._id}`, payload);
      }
      return apiClient.post('/schedules', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success(isEditMode ? 'Schedule updated successfully' : 'Schedule created successfully');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save schedule.');
    },
  });

  const onSubmit = (data: ScheduleFormData) => saveSchedule(data);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="classId" render={({ field }) => (
              <FormItem>
                <FormLabel>Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classes.map((cls) => (<SelectItem key={cls._id} value={cls._id}>{cls.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="teacherId" render={({ field }) => (
              <FormItem>
                <FormLabel>Teacher</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a teacher" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableTeachers.map((teacher) => (
                      <SelectItem key={teacher._id} value={teacher._id}>{teacher.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem>
                <FormLabel>Date and Time</FormLabel>
                <FormControl><Input type="datetime-local" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="room" render={({ field }) => (
              <FormItem>
                <FormLabel>Room</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="recurrence.frequency" render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="recurrence.count" render={({ field }) => (
              <FormItem>
                <FormLabel>Occurrences</FormLabel>
                <FormControl><Input type="number" min="1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Schedule'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


// =================================================================
// 4. HELPER COMPONENT: ScheduleTable
// =================================================================

type ScheduleTableProps = {
  schedules: PopulatedSchedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
};

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedules, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return <div>Loading schedules...</div>; // Or a skeleton loader
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Class</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Teacher</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Date</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {schedules.length === 0 ? (
            <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">No upcoming schedules.</td></tr>
          ) : (
            schedules.map((schedule) => (
              <tr key={schedule._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{schedule.class?.name || 'N/A'}</td>
                <td className="px-4 py-3 text-gray-700">{schedule.teacher?.name || 'N/A'}</td>
                <td className="px-4 py-3 text-gray-700">{new Date(schedule.date).toLocaleString()}</td>
                <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(schedule)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(schedule._id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
// 5. MAIN COMPONENT: Scheduling
// =================================================================

const Scheduling: React.FC = () => {
  const queryClient = useQueryClient();

  const [formDialogState, setFormDialogState] = useState<{ open: boolean; scheduleData?: Schedule | null }>({ open: false });
  const [deleteDialogState, setDeleteDialogState] = useState<{ open: boolean; scheduleId?: string }>({ open: false });

  // Fetch Schedules
  const { data: schedulesResponse, isLoading: isLoadingSchedules, isError: isSchedulesError, error: schedulesError } = useQuery<{ schedules: PopulatedSchedule[] }>({
    queryKey: ['schedules'],
    queryFn: () => apiClient.get('/schedules'),
  });

  // Fetch Classes
  const { data: classesResponse, isLoading: isLoadingClasses } = useQuery<{ classes: Class[] }>({
    queryKey: ['classes'],
    queryFn: () => apiClient.get('/classes'),
  });

  // Fetch Teachers
  const { data: teachersResponse, isLoading: isLoadingTeachers } = useQuery<{ users: User[] }>({
    queryKey: ['users', { role: 'Teacher' }], // More specific query key
    queryFn: () => apiClient.get('/users/teachers'),
  });

  // Mutation for deleting a schedule
  const { mutate: deleteSchedule, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule deleted successfully');
      setDeleteDialogState({ open: false });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete schedule.');
    },
  });

  const handleOpenCreate = () => setFormDialogState({ open: true, scheduleData: null });
  const handleOpenEdit = (schedule: Schedule) => setFormDialogState({ open: true, scheduleData: schedule });
  const handleDeleteRequest = (id: string) => setDeleteDialogState({ open: true, scheduleId: id });
  const handleConfirmDelete = () => {
    if (deleteDialogState.scheduleId) {
      deleteSchedule(deleteDialogState.scheduleId);
    }
  };

  const schedules = schedulesResponse?.schedules || [];
  const classes = classesResponse?.classes || [];
  const teachers = teachersResponse?.users || [];
  const isLoading = isLoadingSchedules || isLoadingClasses || isLoadingTeachers;

  if (isSchedulesError) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-md">Error loading schedules: {schedulesError.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Class Scheduling</h1>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      <DayPicker
        mode="single"
        selected={undefined}
        onSelect={() => {}}
      />

      <Card>
        <CardHeader><CardTitle>Upcoming Schedules</CardTitle></CardHeader>
        <CardContent>
          <ScheduleTable
            schedules={schedules}
            isLoading={isLoading}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteRequest}
          />
        </CardContent>
      </Card>

      <ScheduleFormDialog
        isOpen={formDialogState.open}
        onOpenChange={(open) => setFormDialogState({ ...formDialogState, open })}
        scheduleData={formDialogState.scheduleData}
        classes={classes}
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

export default Scheduling;