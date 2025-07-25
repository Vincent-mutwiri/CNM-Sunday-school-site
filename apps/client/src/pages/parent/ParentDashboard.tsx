import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Baby, Calendar, BookOpen, Camera, CheckCircle, XCircle } from 'lucide-react';
import { calculateAge } from '@/lib/dateUtils';
import { useParentDashboard } from '@/hooks/useDashboardData';
import { formatDate } from '@/lib/utils';

const ChildSummaryCard: React.FC<{ 
  child: any; 
  upcomingSchedule: any; 
  recentAttendance: any; 
  recentGrade: any 
}> = ({ child, upcomingSchedule, recentAttendance, recentGrade }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Baby className="mr-2 h-5 w-5" />
          {child.firstName} {child.lastName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><span className="font-medium">Age:</span> {calculateAge(child.dateOfBirth)} years old</p>
          <p><span className="font-medium">Class:</span> {child.class?.name || 'N/A'}</p>
          
          {upcomingSchedule && (
            <p>
              <span className="font-medium">Next Class:</span>{' '}
              {formatDate(upcomingSchedule.date)} at {upcomingSchedule.startTime}
            </p>
          )}
          
          {recentAttendance && (
            <p>
              <span className="font-medium">Last Attendance:</span>{' '}
              {recentAttendance.status === 'present' ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle className="mr-1 h-4 w-4" /> Present
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <XCircle className="mr-1 h-4 w-4" /> Absent
                </span>
              )}
            </p>
          )}
          
          {recentGrade && (
            <p>
              <span className="font-medium">Last Grade:</span>{' '}
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {recentGrade.grade}
              </span>
            </p>
          )}
        </div>
        <Button className="w-full mt-4" variant="outline">
          View Full Report
        </Button>
      </CardContent>
    </Card>
  );
};

const ParentDashboard: React.FC = () => {
  const { 
    children, 
    upcomingSchedules, 
    recentAttendance, 
    recentGrades,
    isLoading 
  } = useParentDashboard();

  // Group data by child
  const getChildData = (childId: string) => {
    const upcomingSchedule = upcomingSchedules.find(
      schedule => schedule.class?._id === children.find(c => c._id === childId)?.class?._id
    );
    
    const recentAttendanceRecord = recentAttendance.find(
      record => record.child?._id === childId
    );
    
    const recentGrade = recentGrades.find(
      grade => grade.student?._id === childId
    );
    
    return { upcomingSchedule, recentAttendanceRecord, recentGrade };
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Parent Dashboard</h1>

      {isLoading && <p>Loading...</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child) => {
          const { upcomingSchedule, recentAttendanceRecord, recentGrade } = getChildData(child._id);
          return (
            <ChildSummaryCard
              key={child._id}
              child={child}
              upcomingSchedule={upcomingSchedule}
              recentAttendance={recentAttendanceRecord}
              recentGrade={recentGrade}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* We'll implement this properly when we have events data */}
              <p className="text-sm text-gray-500">No upcoming events</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full flex items-center" variant="outline">
              <Baby className="mr-2 h-4 w-4" />
              Register New Child
            </Button>
            <Button className="w-full flex items-center" variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Resources
            </Button>
            <Button className="w-full flex items-center" variant="outline">
              <Camera className="mr-2 h-4 w-4" />
              View Gallery
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;

