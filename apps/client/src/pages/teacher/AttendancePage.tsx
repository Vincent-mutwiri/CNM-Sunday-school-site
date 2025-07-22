import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth.js';
import { api } from '../../lib/axios.js';
import { format } from 'date-fns';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx';
import { Skeleton } from '../../components/ui/skeleton.jsx';

interface Schedule {
  _id: string;
  class: {
    _id: string;
    name: string;
    ageRange: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  students: Array<{
    _id: string;
    firstName: string;
    lastName: string;
  }>;
}

export function TeacherAttendancePage() {
  const { user } = useAuth();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Fetch teacher's schedules
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['teacherSchedules'],
    queryFn: async () => {
      const { data } = await api.get('/api/schedules/teacher/me');
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>{format(new Date(), 'MMMM d, yyyy')}</span>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Classes</TabsTrigger>
          <TabsTrigger value="past">Past Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schedules
              .filter((s: Schedule) => new Date(s.date) >= new Date())
              .map((schedule: Schedule) => (
                <ScheduleCard 
                  key={schedule._id} 
                  schedule={schedule} 
                  onSelect={() => setSelectedSchedule(schedule)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schedules
              .filter((s: Schedule) => new Date(s.date) < new Date())
              .map((schedule: Schedule) => (
                <ScheduleCard 
                  key={schedule._id} 
                  schedule={schedule} 
                  onSelect={() => setSelectedSchedule(schedule)}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedSchedule && (
        <AttendanceForm 
          schedule={selectedSchedule} 
          onClose={() => setSelectedSchedule(null)} 
        />
      )}
    </div>
  );
}

function ScheduleCard({ schedule, onSelect }: { schedule: Schedule; onSelect: () => void }) {
  const isPast = new Date(schedule.date) < new Date();
  
  return (
    <Card className="cursor-pointer transition-all hover:shadow-md" onClick={onSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{schedule.class.name}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {format(new Date(schedule.date), 'MMM d, yyyy')}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {schedule.startTime} - {schedule.endTime}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">{schedule.students.length}</span> students
          </div>
          {isPast ? (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="mr-1 h-4 w-4" />
              Completed
            </div>
          ) : (
            <div className="flex items-center text-sm text-amber-600">
              <Clock className="mr-1 h-4 w-4" />
              Upcoming
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AttendanceForm({ schedule, onClose }: { schedule: Schedule; onClose: () => void }) {
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Initialize attendance state
    const initialAttendance: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    const initialNotes: Record<string, string> = {};
    
    schedule.students.forEach((student) => {
      initialAttendance[student._id] = 'Present';
      initialNotes[student._id] = '';
    });
    
    setAttendance(initialAttendance);
    setNotes(initialNotes);
  }, [schedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const records = schedule.students.map((student) => ({
        childId: student._id,
        status: attendance[student._id],
        notes: notes[student._id] || '',
      }));
      
      await api.post('/api/attendance/mark', {
        scheduleId: schedule._id,
        records,
      });
      
      onClose();
    } catch (error) {
      console.error('Error marking attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Mark Attendance</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium">{schedule.class.name}</h3>
          <p className="text-muted-foreground">
            {format(new Date(schedule.date), 'EEEE, MMMM d, yyyy')} • {schedule.startTime} - {schedule.endTime}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6 max-h-[60vh] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {schedule.students.map((student) => (
                  <tr key={student._id} className="border-b">
                    <td className="px-4 py-3">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded-md border p-2"
                        value={attendance[student._id] || 'Present'}
                        onChange={(e) =>
                          setAttendance((prev) => ({
                            ...prev,
                            [student._id]: e.target.value as 'Present' | 'Absent' | 'Late',
                          }))
                        }
                      >
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        className="w-full rounded-md border p-2"
                        placeholder="Add note"
                        value={notes[student._id] || ''}
                        onChange={(e) =>
                          setNotes((prev) => ({
                            ...prev,
                            [student._id]: e.target.value,
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
