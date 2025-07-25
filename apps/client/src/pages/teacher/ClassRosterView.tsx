import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Check, X } from 'lucide-react';

// Mock data - in a real app this would come from the API
const mockClass = {
  id: '1',
  name: 'Preschool - Room 101',
  teacher: 'Ms. Johnson',
  studentCount: 12
};

const mockStudents = [
  { id: '1', name: 'Emma Johnson', age: 4, profilePic: '' },
  { id: '2', name: 'Noah Williams', age: 5, profilePic: '' },
  { id: '3', name: 'Olivia Brown', age: 4, profilePic: '' },
  { id: '4', name: 'Liam Jones', age: 5, profilePic: '' },
  { id: '5', name: 'Ava Garcia', age: 4, profilePic: '' },
  { id: '6', name: 'Lucas Miller', age: 5, profilePic: '' }
];

const ClassRosterView: React.FC = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<Record<string, { present: boolean; notes: string }>>({});
  
  // Initialize attendance state
  React.useEffect(() => {
    const initialAttendance: Record<string, { present: boolean; notes: string }> = {};
    mockStudents.forEach(student => {
      initialAttendance[student.id] = { present: true, notes: '' };
    });
    setAttendance(initialAttendance);
  }, []);

  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setAttendance({
      ...attendance,
      [studentId]: {
        ...attendance[studentId],
        present
      }
    });
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendance({
      ...attendance,
      [studentId]: {
        ...attendance[studentId],
        notes
      }
    });
  };

  const handleSubmitAttendance = () => {
    // In a real implementation, you would send this data to the backend
    console.log('Attendance submitted:', attendance);
    // Navigate back to the classes page or show a success message
    navigate('/teacher/classes');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{mockClass.name}</h1>
          <p className="text-gray-600">Teacher: {mockClass.teacher}</p>
        </div>
        <Button onClick={() => navigate('/teacher/classes')}>
          Back to Classes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Roster & Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockStudents.map(student => (
                <Card key={student.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-gray-500">Age: {student.age}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`present-${student.id}`}
                          checked={attendance[student.id]?.present}
                          onCheckedChange={(checked) => handleAttendanceChange(student.id, checked as boolean)}
                        />
                        <Label htmlFor={`present-${student.id}`}>Present</Label>
                        
                        <Checkbox
                          id={`absent-${student.id}`}
                          checked={!attendance[student.id]?.present}
                          onCheckedChange={(checked) => handleAttendanceChange(student.id, !(checked as boolean))}
                        />
                        <Label htmlFor={`absent-${student.id}`}>Absent</Label>
                      </div>
                      
                      <div>
                        <Label htmlFor={`notes-${student.id}`} className="text-sm">Notes</Label>
                        <Textarea
                          id={`notes-${student.id}`}
                          value={attendance[student.id]?.notes || ''}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          placeholder="Add attendance notes..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => navigate('/teacher/classes')}>
                Cancel
              </Button>
              <Button onClick={handleSubmitAttendance}>
                Submit Attendance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassRosterView;