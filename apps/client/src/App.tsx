import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import UserManagement from '@/pages/admin/UserManagement';
import ClassManagement from '@/pages/admin/ClassManagement';
import Scheduling from '@/pages/admin/Scheduling';
import ResourceModeration from '@/pages/admin/ResourceModeration';
import GalleryModeration from '@/pages/admin/GalleryModeration';
import AdminSettings from '@/pages/admin/AdminSettings';
import Gallery from '@/pages/Gallery';
import ResourceLibrary from '@/pages/ResourceLibrary';
import TeacherResources from '@/pages/teacher/TeacherResources';
import GalleryUpload from '@/pages/teacher/GalleryUpload';
import TeacherClasses from '@/pages/teacher/TeacherClasses';
import Children from '@/pages/parent/Children';
import ParentResources from '@/pages/parent/ParentResources';
import ParentGallery from '@/pages/parent/ParentGallery';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          {/* Admin routes */}
          <Route path="admin/users" element={<UserManagement />} />
          <Route path="admin/classes" element={<ClassManagement />} />
          <Route path="admin/schedules" element={<Scheduling />} />
          <Route path="admin/resources" element={<ResourceModeration />} />
          <Route path="admin/gallery" element={<GalleryModeration />} />
          <Route path="admin/settings" element={<AdminSettings />} />

          {/* Teacher routes */}
          <Route path="teacher/classes" element={<TeacherClasses />} />
          <Route path="teacher/attendance" element={<div>Attendance (Coming Soon)</div>} />
          <Route path="teacher/resources" element={<TeacherResources />} />
          <Route path="teacher/gallery" element={<GalleryUpload />} />

          {/* Parent routes */}
          <Route path="parent/children" element={<Children />} />
          <Route path="parent/attendance" element={<div>Attendance (Coming Soon)</div>} />
          <Route path="parent/resources" element={<ParentResources />} />
          <Route path="parent/gallery" element={<ParentGallery />} />

          {/* Shared pages */}
          <Route path="resources" element={<ResourceLibrary />} />
          <Route path="gallery" element={<Gallery />} />
          
          <Route path="" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;

