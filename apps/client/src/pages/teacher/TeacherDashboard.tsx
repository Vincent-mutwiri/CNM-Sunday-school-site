import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, FileText } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-800">New Announcement</h2>
        <p className="text-blue-700">Don't forget about the upcoming Easter celebration on April 9th!</p>
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
              <div className="border-l-4 border-blue-500 pl-3">
                <p className="font-medium">Ages 6-8</p>
                <p className="text-sm text-gray-600">Sunday, March 12 - 10:00 AM</p>
                <p className="text-sm text-gray-500">15 students</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <p className="font-medium">Ages 9-11</p>
                <p className="text-sm text-gray-600">Sunday, March 19 - 11:00 AM</p>
                <p className="text-sm text-gray-500">12 students</p>
              </div>
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
              <div className="text-sm">
                <p className="font-medium">Noah's Ark Craft</p>
                <p className="text-gray-600">Approved</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Memory Verse Song</p>
                <p className="text-yellow-600">Pending</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Easter Lesson Plan</p>
                <p className="text-gray-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;

