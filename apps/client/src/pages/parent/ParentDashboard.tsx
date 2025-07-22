import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Baby, Calendar, BookOpen, Camera } from 'lucide-react';
import { calculateAge } from '@/lib/dateUtils';
import { useParentDashboard } from '@/hooks/useDashboardData';

const ParentDashboard: React.FC = () => {
  const { children, events, isLoading } = useParentDashboard();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Parent Dashboard</h1>

      {isLoading && <p>Loading...</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child) => (
          <Card key={child._id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Baby className="mr-2 h-5 w-5" />
                {child.firstName} {child.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-medium">Age:</span> {calculateAge(child.dateOfBirth)} years old</p>
                <p><span className="font-medium">Class:</span> {typeof child.assignedClass === 'string' ? child.assignedClass : child.assignedClass?.name || 'N/A'}</p>
                <p><span className="font-medium">Last Attendance:</span> N/A</p>
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
              {events.map((event) => (
                <div key={event._id} className="border-l-4 border-primary pl-3">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-600">{event.type}</p>
                  <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-sm text-gray-500">No upcoming events</p>
              )}
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

