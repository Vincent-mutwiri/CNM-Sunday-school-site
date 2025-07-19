import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Baby, Calendar, BookOpen, Camera } from 'lucide-react';
import { calculateAge } from '@/lib/utils';

const ParentDashboard: React.FC = () => {
  // Mock data - in real app, this would come from API
  const children = [
    {
      id: '1',
      firstName: 'Emma',
      lastName: 'Johnson',
      dateOfBirth: '2015-06-15',
      assignedClass: 'Ages 6-8'
    },
    {
      id: '2',
      firstName: 'Liam',
      lastName: 'Johnson',
      dateOfBirth: '2018-03-22',
      assignedClass: 'Ages 3-5'
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Easter Celebration',
      type: 'Event',
      date: '2024-04-09'
    },
    {
      id: '2',
      title: 'Memory Verse Challenge',
      type: 'Memory Verse',
      date: '2024-03-20'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Parent Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child) => (
          <Card key={child.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Baby className="mr-2 h-5 w-5" />
                {child.firstName} {child.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-medium">Age:</span> {calculateAge(child.dateOfBirth)} years old</p>
                <p><span className="font-medium">Class:</span> {child.assignedClass}</p>
                <p><span className="font-medium">Last Attendance:</span> Present (March 5)</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
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
              {upcomingEvents.map((event) => (
                <div key={event.id} className="border-l-4 border-primary pl-3">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-600">{event.type}</p>
                  <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                </div>
              ))}
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

