import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';

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
          <Route path="admin/users" element={<div>User Management (Coming Soon)</div>} />
          <Route path="admin/classes" element={<div>Class Management (Coming Soon)</div>} />
          <Route path="admin/schedules" element={<div>Scheduling (Coming Soon)</div>} />
          <Route path="admin/resources" element={<div>Resource Moderation (Coming Soon)</div>} />
          <Route path="admin/gallery" element={<div>Gallery Moderation (Coming Soon)</div>} />
          <Route path="admin/settings" element={<div>Settings (Coming Soon)</div>} />
          
          {/* Teacher routes */}
          <Route path="teacher/classes" element={<div>My Classes (Coming Soon)</div>} />
          <Route path="teacher/attendance" element={<div>Attendance (Coming Soon)</div>} />
          <Route path="teacher/resources" element={<div>Resources (Coming Soon)</div>} />
          <Route path="teacher/gallery" element={<div>Gallery Upload (Coming Soon)</div>} />
          
          {/* Parent routes */}
          <Route path="parent/children" element={<div>My Children (Coming Soon)</div>} />
          <Route path="parent/attendance" element={<div>Attendance (Coming Soon)</div>} />
          <Route path="parent/resources" element={<div>Resources (Coming Soon)</div>} />
          <Route path="parent/gallery" element={<div>Gallery (Coming Soon)</div>} />
          
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

