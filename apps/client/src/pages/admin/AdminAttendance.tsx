import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Schedule, Attendance } from '@/types';
import { useScheduleAttendance } from '@/hooks/useScheduleAttendance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AdminAttendance: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const schedulesQuery = useQuery<{ schedules: Schedule[] }>({
    queryKey: ['schedules'],
    queryFn: () => apiClient.get('/schedules'),
  });

  const { data } = useScheduleAttendance(selectedSchedule);

  const mutation = useMutation({
    mutationFn: (payload: { scheduleId: string; records: Array<{ childId: string; status: 'Present' | 'Absent'; notes?: string }> }) =>
      apiClient.post('/attendance/mark', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'schedule', selectedSchedule] });
    },
  });

  const handleSubmit = () => {
    if (!data) return;
    const records = data.attendanceRecords.map(r => ({ childId: typeof r.child === 'string' ? r.child : r.child._id, status: r.status, notes: r.notes }));
    mutation.mutate({ scheduleId: selectedSchedule, records });
  };

  const schedules = schedulesQuery.data?.schedules ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance Records</h1>
      <ul className="space-y-2">
        {schedules.map(s => (
          <li key={s._id} className="flex justify-between border p-2 rounded">
            <span>{new Date(s.date).toLocaleString()} - {s.className || (typeof s.class === 'object' ? s.class.name : '')}</span>
            <Button size="sm" onClick={() => setSelectedSchedule(s._id)}>Edit</Button>
          </li>
        ))}
      </ul>

      <Dialog open={!!selectedSchedule} onOpenChange={() => setSelectedSchedule('')}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
          </DialogHeader>
          {data ? (
            <div className="space-y-4">
              {data.schedule.students.map((student: any) => {
                const record = data.attendanceRecords.find(r => typeof r.child === 'string' ? r.child === student._id : r.child._id === student._id) || { status: 'Absent', notes: '' } as Attendance;
                return (
                  <div key={student._id} className="flex items-center space-x-2">
                    <span className="w-40">{student.firstName} {student.lastName}</span>
                    <select
                      value={record.status}
                      onChange={e => {
                        const val = e.target.value as 'Present' | 'Absent';
                        if (record) record.status = val;
                      }}
                      className="border rounded p-1"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                    <input
                      className="flex-1 border rounded p-1"
                      placeholder="Notes"
                      value={record.notes || ''}
                      onChange={e => { if (record) record.notes = e.target.value; }}
                    />
                  </div>
                );
              })}
              <Button onClick={handleSubmit} disabled={mutation.isPending}>Save</Button>
            </div>
          ) : (
            <div className="p-4">Loading...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAttendance;
