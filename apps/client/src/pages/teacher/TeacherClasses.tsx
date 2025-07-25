import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users } from 'lucide-react';

// Mock data - in a real app this would come from the API
const mockClasses = [
  { 
    id: '1', 
    name: 'Preschool - Room 101', 
    studentCount: 12,
    nextSchedule: {
      date: '2023-06-15',
      time: '9:00 AM - 10:30 AM'
    }
  },
  { 
    id: '2', 
    name: 'Kindergarten - Room 102', 
    studentCount: 18,
    nextSchedule: {
      date: '2023-06-16',
      time: '10:00 AM - 11:30 AM'
    }
  },
  { 
    id: '3', 
    name: '1st Grade - Room 103', 
    studentCount: 15,
    nextSchedule: {
      date: '2023-06-17',
      time: '11:00 AM - 12:30 PM'
    }
  }
];

const ClassCard: React.FC<{ classData: any }> = ({ classData }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
          {classData.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 text-gray-500" />
            <span>{classData.studentCount} students</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Next Class:</p>
            <p className="text-sm">{classData.nextSchedule.date}</p>
            <p className="text-sm text-gray-500">{classData.nextSchedule.time}</p>
          </div>
          <Button 
            className="w-full" 
            onClick={() => navigate(`/teacher/classes/${classData.id}`)}
          >
            View Class Roster
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const TeacherClasses: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Classes</h1>
        <Button>Create New Class</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClasses.map(cls => (
          <ClassCard key={cls.id} classData={cls} />
        ))}
      </div>
    </div>
  );
};

export default TeacherClasses;