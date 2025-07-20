import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, FileText } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import { useTeacherDashboard } from '@/hooks/useDashboardData';

const TeacherDashboard: React.FC = () => {
  const { schedules, events, resources, isLoading } = useTeacherDashboard();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Teacher Dashboard</h1>

      {isLoading && <p>Loading...</p>}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-800">New Announcement</h2>
        <p className="text-blue-700">
          {events[0] ? events[0].title : 'No announcements available'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              My Upcoming Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div key={schedule._id} className="border-l-4 border-blue-500 pl-3">
                  <p className="font-medium">{(schedule.class as any).name}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(schedule.date)} - {formatTime(schedule.date)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(schedule.students as any[]).length} students
                  </p>
                </div>
              ))}
              {schedules.length === 0 && (
                <p className="text-sm text-gray-500">No upcoming classes</p>
              )}
            </div>
            <Button className="w-full mt-4" variant="outline">
              View All Classes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Mark Attendance
            </Button>
            <Button className="w-full" variant="outline">
              Upload Resource
            </Button>
            <Button className="w-full" variant="outline">
              Add Gallery Photos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resources.slice(0, 3).map((res) => (
                <div key={res._id} className="text-sm">
                  <p className="font-medium">{res.title}</p>
                  <p className={res.status === 'Pending' ? 'text-yellow-600' : 'text-gray-600'}>{res.status}</p>
                </div>
              ))}
              {resources.length === 0 && (
                <p className="text-sm text-gray-500">No resources uploaded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;

