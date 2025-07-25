import React, { useState } from 'react';
import { useTeacherClasses, useMarkAttendance } from '@/hooks/useTeacherClasses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

const AttendanceMarking: React.FC = () => {
  console.log('Rendering AttendanceMarking component');
  const { data, isLoading, error, isError } = useTeacherClasses();
  const { mutate: markAttendance, isPending } = useMarkAttendance();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  
  console.log('useTeacherClasses data:', { data, isLoading, error, isError });

  const selectedClass = data?.classes.find(cls => cls._id === selectedClassId);

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    if (!selectedClass) return;
    
    markAttendance({
      classId: selectedClass._id,
      studentId,
      status,
      notes: notes[studentId] || '',
    });
  };

  const handleNotesChange = (studentId: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [studentId]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium">Error loading classes</h3>
        <p className="mt-1 text-sm text-gray-500">
          {error instanceof Error ? error.message : 'Failed to load class information. Please try again later.'}
        </p>
      </div>
    );
  }

  const classes = data?.classes || [];
  
  if (classes.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-2 text-lg font-medium">No classes available</h3>
        <p className="mt-1 text-sm text-gray-500">
          {isLoading 
            ? 'Loading classes...' 
            : 'You don\'t have any classes assigned to you or the backend is not available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Mark Attendance</h1>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="mt-2 sm:mt-0 rounded-md border p-2"
        >
          <option value="">Select a class</option>
          {classes.map((cls) => {
            const dateStr = cls.schedule?.date ? format(new Date(cls.schedule.date), 'PPP') : 'No schedule';
            return (
              <option key={cls._id} value={cls._id}>
                {cls.name} - {dateStr}
              </option>
            );
          })}
        </select>
      </div>

      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {selectedClass.name} - {format(new Date(selectedClass.schedule.date), 'PPP')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedClass.students.map((student) => (
                <div key={student._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        {student.firstName} {student.lastName}
                      </h3>
                      <div className="mt-1">
                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={notes[student._id] || ''}
                          onChange={(e) => handleNotesChange(student._id, e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant={student.attendanceStatus === 'Present' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(student._id, 'Present')}
                        disabled={isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Present
                      </Button>
                      <Button
                        variant={student.attendanceStatus === 'Late' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(student._id, 'Late')}
                        disabled={isPending}
                      >
                        <Clock className="h-4 w-4 mr-1" /> Late
                      </Button>
                      <Button
                        variant={student.attendanceStatus === 'Absent' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(student._id, 'Absent')}
                        disabled={isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Absent
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceMarking;
