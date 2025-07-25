import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { Calendar, Download, Search, User } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { api } from '../../lib/axios';
import { DatePickerWithRange } from '../../components/DatePickerWithRange';
import { useAuth } from '../../hooks/useAuth';

interface AttendanceRecord {
  _id: string;
  child: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  schedule: {
    _id: string;
    class: {
      name: string;
      ageRange: string;
    };
    date: string;
    teacher: {
      name: string;
    };
  };
  status: 'Present' | 'Absent' | 'Late';
  notes: string;
  markedBy: {
    name: string;
  };
  createdAt: string;
}

export function ChildAttendancePage() {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch parent's children
  const { data: children = [] } = useQuery({
    queryKey: ['myChildren'],
    queryFn: async () => {
      const { data } = await api.get('/api/families/my-children');
      return data;
    },
    enabled: !!user,
  });

  // Set default selected child if not set
  if (children.length > 0 && !selectedChild) {
    setSelectedChild(children[0]._id);
  }

  // Fetch attendance for selected child
  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['childAttendance', selectedChild, dateRange],
    queryFn: async () => {
      if (!selectedChild) return [];
      
      const params = new URLSearchParams();
      if (dateRange?.from) params.append('startDate', dateRange.from.toISOString());
      if (dateRange?.to) params.append('endDate', dateRange.to.toISOString());
      
      const { data } = await api.get(`/api/attendance/child/${selectedChild}?${params.toString()}`);
      return data.attendanceRecords || [];
    },
    enabled: !!selectedChild,
  });

  const filteredAttendance = attendance.filter((record: AttendanceRecord) => {
    const searchLower = searchTerm.toLowerCase();
    const className = record.schedule.class.name.toLowerCase();
    const teacherName = record.schedule.teacher.name.toLowerCase();
    const notes = record.notes?.toLowerCase() || '';
    
    return (
      className.includes(searchLower) ||
      teacherName.includes(searchLower) ||
      notes.includes(searchLower) ||
      record.status.toLowerCase().includes(searchLower)
    );
  });

  const handleExport = async () => {
    if (!selectedChild) return;
    
    try {
      const response = await api.get(`/api/attendance/child/${selectedChild}/export`, {
        responseType: 'blob',
        params: {
          startDate: dateRange?.from?.toISOString(),
          endDate: dateRange?.to?.toISOString(),
        },
      });
      
      const child = children.find((c: any) => c._id === selectedChild);
      const childName = child ? `${child.firstName}_${child.lastName}` : 'attendance';
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${childName}-attendance-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting attendance:', error);
    }
  };

  if (!user) {
    return <div>Please log in to view attendance records.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <h1 className="text-2xl font-bold">My Children's Attendance</h1>
        <Button onClick={handleExport} variant="outline" disabled={!selectedChild}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="child">Child</Label>
              <Select
                value={selectedChild}
                onValueChange={setSelectedChild}
                disabled={children.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={children.length === 0 ? 'No children found' : 'Select child'} />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child: any) => (
                    <SelectItem key={child._id} value={child._id}>
                      {child.firstName} {child.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search classes, teachers..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          {!selectedChild ? (
            <div className="flex h-64 items-center justify-center rounded-lg border">
              <div className="text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No child selected</h3>
                <p className="text-muted-foreground">
                  {children.length === 0
                    ? "You don't have any children registered."
                    : 'Please select a child to view attendance.'}
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex h-64 items-center justify-center rounded-lg border">
              <p>Loading attendance records...</p>
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border">
              <Calendar className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No attendance records</h3>
              <p className="text-muted-foreground">
                No attendance records found for the selected date range.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.map((record: AttendanceRecord) => (
                    <TableRow key={record._id}>
                      <TableCell>
                        <div className="font-medium">
                          {format(new Date(record.schedule.date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {record.schedule.class.ageRange}
                        </div>
                      </TableCell>
                      <TableCell>{record.schedule.class.name}</TableCell>
                      <TableCell>{record.schedule.teacher.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'Late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="line-clamp-2">
                          {record.notes || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
