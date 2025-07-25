import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// UTILS & TYPES (Assuming these are in your project)
import { apiClient } from '@/utils/api';
import { formatDate, formatTime } from '@/lib/utils'; // Using one consistent utils import
import { Schedule, Class, User, Resource, Event, Grade } from '@/types'; // Assuming Event type exists

// SHADCN/UI COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ICONS
import { Calendar, Users, Plus, BookOpen, Megaphone, FileText } from 'lucide-react';
import { useTeacherDashboard } from '@/hooks/useDashboardData';

// =================================================================
// 2. SUB-COMPONENT: Dashboard Skeleton (Loading State)
// =================================================================

const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="h-9 w-1/3 bg-gray-200 rounded animate-pulse"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-[250px] bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-[200px] bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-[250px] bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-[200px] bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-20 w-full bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// =================================================================
// 3. SUB-COMPONENT: Dashboard Cards
// =================================================================

const UpcomingScheduleCard: React.FC<{ schedules: Schedule[] }> = ({ schedules }) => {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Calendar className="mr-2 h-5 w-5 text-blue-500" /> My Upcoming Schedule</CardTitle>
        <CardDescription>Your next teaching assignments. Click to mark attendance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedules.length > 0 ? (
            schedules.slice(0, 3).map((schedule) => (
              <div key={schedule._id} className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-800">{schedule.class?.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(schedule.date)} at {formatTime(schedule.date)}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/teacher/attendance/${schedule._id}`)}>
                  Mark Attendance
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">You have no upcoming classes scheduled.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const RecentGradesCard: React.FC<{ grades: Grade[] }> = ({ grades }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-purple-500" /> Recent Grades</CardTitle>
        <CardDescription>Latest grades you've entered for your students.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {grades.length > 0 ? (
            grades.slice(0, 5).map((grade) => (
              <div key={grade._id} className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-800">{grade.assignmentTitle}</p>
                  <p className="text-sm text-gray-500">
                    {grade.student?.name} - {grade.class?.name}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {grade.grade}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No grades entered yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-green-500" /> Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/teacher/resources/upload')}><Plus className="mr-2 h-4 w-4" /> Upload a Resource</Button>
        <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/teacher/gallery/upload')}><Plus className="mr-2 h-4 w-4" /> Add Gallery Photos</Button>
        <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/teacher/events/new')}><Plus className="mr-2 h-4 w-4" /> Create an Event</Button>
        <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/teacher/gradebook')}><Plus className="mr-2 h-4 w-4" /> Gradebook</Button>
      </CardContent>
    </Card>
  );
};

const AnnouncementsCard: React.FC<{ events: Event[] }> = ({ events }) => {
  const navigate = useNavigate();
  const latestAnnouncement = events.find(e => e.type === 'Announcement');
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Megaphone className="mr-2 h-5 w-5 text-orange-500" /> Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        {latestAnnouncement ? (
          <div>
            <p className="font-semibold text-gray-800">{latestAnnouncement.title}</p>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{latestAnnouncement.description}</p>
            <Button variant="link" className="px-0 h-auto mt-2" onClick={() => navigate('/events')}>View all</Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No recent announcements.</p>
        )}
      </CardContent>
    </Card>
  );
};

const MyClassesCard: React.FC<{ classes: Class[] }> = ({ classes }) => {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><BookOpen className="mr-2 h-5 w-5 text-indigo-500" /> My Assigned Classes</CardTitle>
        <CardDescription>Classes you are assigned to teach.</CardDescription>
      </CardHeader>
      <CardContent>
        {classes.length > 0 ? (
          <div className="space-y-2">
            {classes.map(cls => (
              <div key={cls._id} className="flex justify-between items-center p-2 border-b">
                <div>
                  <p className="font-medium">{cls.name}</p>
                  <p className="text-xs text-gray-500">{cls.ageRange}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/classes/${cls._id}`)}>Details</Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">You are not assigned to any classes yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

// =================================================================
// 4. MAIN COMPONENT: TeacherDashboard
// =================================================================

const TeacherDashboard: React.FC = () => {
  const { classes, upcomingSchedules, recentGrades, isLoading, isError, error } = useTeacherDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-md">Error loading dashboard: {error?.message}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <UpcomingScheduleCard schedules={upcomingSchedules} />
          <MyClassesCard classes={classes} />
          <RecentGradesCard grades={recentGrades} />
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <QuickActionsCard />
          <AnnouncementsCard events={[]} />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
