import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMyChildren } from '@/hooks/useChildren';
import { useChildAttendance } from '@/hooks/useChildAttendance';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

const Attendance: React.FC = () => {
  const { childId } = useParams<{ childId?: string }>();
  const navigate = useNavigate();
  const { children, isLoading: isLoadingChildren } = useMyChildren();
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(childId);
  
  const { data, isLoading, error } = useChildAttendance(selectedChildId);

  // Set the first child as selected if none is selected
  useEffect(() => {
    if (!selectedChildId && children.length > 0 && !isLoadingChildren) {
      const firstChildId = children[0]._id;
      setSelectedChildId(firstChildId);
      navigate(`/parent/attendance/${firstChildId}`, { replace: true });
    }
  }, [children, selectedChildId, isLoadingChildren, navigate]);

  const selectedChild = children.find(child => child._id === selectedChildId);
  const attendanceRecords = data?.attendance || [];

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'Present': 'bg-green-100 text-green-800',
      'Absent': 'bg-red-100 text-red-800',
      'Late': 'bg-yellow-100 text-yellow-800',
    };
    
    const statusClass = statusMap[status] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
      {status}
    </span>;
  };

  const handleChildSelect = (childId: string) => {
    setSelectedChildId(childId);
    navigate(`/parent/attendance/${childId}`);
  };

  if (isLoadingChildren) {
    return <div>Loading...</div>;
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">No children found</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have any children registered yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <select
          value={selectedChildId || ''}
          onChange={(e) => handleChildSelect(e.target.value)}
          className="mt-2 sm:mt-0 rounded-md border p-2"
        >
          {children.map((child) => (
            <option key={child._id} value={child._id}>
              {child.firstName} {child.lastName}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div>Loading attendance records...</div>
      ) : error ? (
        <div>Error loading attendance records</div>
      ) : attendanceRecords.length === 0 ? (
        <div>No attendance records found for {selectedChild?.firstName}.</div>
      ) : (
        <div className="space-y-4">
          {attendanceRecords.map((record) => (
            <Card key={record._id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {formatDate(record.schedule && typeof record.schedule === 'object' 
                      ? (record.schedule as any).date 
                      : record.createdAt
                    )}
                  </h3>
                  {getStatusBadge(record.status)}
                </div>
              </CardHeader>
              <CardContent>
                {record.notes && (
                  <p className="text-sm text-muted-foreground">
                    {record.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Attendance;
