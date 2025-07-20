import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Schedule } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Scheduling: React.FC = () => {
  const { data, isLoading } = useQuery(['schedules'], async () =>
    apiClient.get<{ schedules: Schedule[] }>('/schedules')
  );

  if (isLoading) {
    return <div>Loading schedules...</div>;
  }

  const schedules = data?.schedules ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Scheduling</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Schedules</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">
                  Class
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">
                  Teacher
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule._id}>
                  <td className="px-4 py-2">{(schedule.class as any).name}</td>
                  <td className="px-4 py-2">{(schedule.teacher as any).name}</td>
                  <td className="px-4 py-2">
                    {new Date(schedule.date).toLocaleString()}
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td className="px-4 py-2" colSpan={3}>
                    No schedules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Scheduling;
