import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { Calendar, Search, Filter, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { api } from '../../lib/axios';
import { DatePickerWithRange } from '../../components/DatePickerWithRange';

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

export function AdminAttendancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    teacherId: '',
    classId: '',
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Fetch attendance records with filters
  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['adminAttendance', filters, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.teacherId) params.append('teacherId', filters.teacherId);
      if (filters.classId) params.append('classId', filters.classId);
      if (dateRange?.from) params.append('startDate', dateRange.from.toISOString());
      if (dateRange?.to) params.append('endDate', dateRange.to.toISOString());
      
      const { data } = await api.get(`/api/attendance?${params.toString()}`);
      return data;
    },
  });

  // Fetch teachers for filter
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data } = await api.get('/api/users/teachers');
      return data;
    },
  });

  // Fetch classes for filter
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await api.get('/api/classes');
      return data;
    },
  });

  const filteredAttendance = attendance.filter((record: AttendanceRecord) => {
    const searchLower = searchTerm.toLowerCase();
    const studentName = `${record.child.firstName} ${record.child.lastName}`.toLowerCase();
    const className = record.schedule.class.name.toLowerCase();
    const teacherName = record.schedule.teacher.name.toLowerCase();
    
    return (
      studentName.includes(searchLower) ||
      className.includes(searchLower) ||
      teacherName.includes(searchLower) ||
      record.notes.toLowerCase().includes(searchLower)
    );
  });

  const handleExport = async () => {
    try {
      const response = await api.get('/api/attendance/export', {
        responseType: 'blob',
        params: {
          ...filters,
          startDate: dateRange?.from?.toISOString(),
          endDate: dateRange?.to?.toISOString(),
        },
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting attendance:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <h1 className="text-2xl font-bold">Attendance Management</h1>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-4 flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <h2 className="text-lg font-medium">Filters</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search students, classes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher</Label>
            <Select
              value={filters.teacherId}
              onValueChange={(value) => setFilters({ ...filters, teacherId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Teachers</SelectItem>
                {teachers.map((teacher: any) => (
                  <SelectItem key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select
              value={filters.classId}
              onValueChange={(value) => setFilters({ ...filters, classId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {classes.map((cls: any) => (
                  <SelectItem key={cls._id} value={cls._id}>
                    {cls.name}
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
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Marked By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredAttendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No attendance records found
                </TableCell>
              </TableRow>
            ) : (
              filteredAttendance.map((record: AttendanceRecord) => (
                <TableRow key={record._id}>
                  <TableCell>
                    {format(new Date(record.schedule.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {record.child.firstName} {record.child.lastName}
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
                  <TableCell className="max-w-xs truncate">
                    {record.notes || '-'}
                  </TableCell>
                  <TableCell>{record.markedBy.name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
