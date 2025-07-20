import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAdminStats } from '@/hooks/useDashboardData';

const StatCard: React.FC<{ title: string; value: number | string }> = ({ title, value }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

const AdminDashboard: React.FC = () => {
  const { users, classes, pendingResources, events, isLoading } = useAdminStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {isLoading && <p>Loading stats...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={users.length} />
        <StatCard title="Active Classes" value={classes.length} />
        <StatCard title="Pending Resources" value={pendingResources.length} />
        <StatCard title="Upcoming Events" value={events.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {events.slice(0, 5).map((event) => (
                <li key={event._id}>{event.title}</li>
              ))}
              {events.length === 0 && <li className="text-sm text-gray-500">No upcoming events</li>}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for chart */}
            <div className="h-64 bg-gray-100 flex items-center justify-center rounded-md">
              <p className="text-gray-500">Attendance Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

