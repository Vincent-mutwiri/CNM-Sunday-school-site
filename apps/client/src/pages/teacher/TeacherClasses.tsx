import React from 'react';
import { useTeacherSchedules } from '@/hooks/useSchedules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime } from '@/lib/utils';

const TeacherClasses: React.FC = () => {
  const { schedules, isLoading } = useTeacherSchedules();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Classes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p>Loading schedules...</p>}
          {schedules.map((sch) => (
            <div key={sch._id} className="border p-2 rounded-md">
              <p className="font-medium">{(sch.class as any).name}</p>
              <p className="text-sm text-gray-600">
                {formatDate(sch.date)} - {formatTime(sch.date)}
              </p>
            </div>
          ))}
          {schedules.length === 0 && !isLoading && (
            <p className="text-sm text-gray-500">No upcoming classes</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherClasses;
