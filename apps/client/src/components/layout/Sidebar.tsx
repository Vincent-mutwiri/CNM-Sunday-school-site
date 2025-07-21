import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  GraduationCap, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Camera, 
  Settings,
  Baby,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Resources', href: '/resources', icon: FileText },
      { name: 'Gallery', href: '/gallery', icon: Camera },
    ];

    if (user?.role === 'Admin') {
      return [
        ...baseItems,
        { name: 'User Management', href: '/admin/users', icon: Users },
        { name: 'Class Management', href: '/admin/classes', icon: GraduationCap },
        { name: 'Scheduling', href: '/admin/schedules', icon: Calendar },
        { name: 'Resource Moderation', href: '/admin/resources', icon: FileText },
        { name: 'Gallery Moderation', href: '/admin/gallery', icon: Camera },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ];
    }

    if (user?.role === 'Teacher') {
      return [
        ...baseItems,
        { name: 'My Classes', href: '/teacher/classes', icon: GraduationCap },
        { name: 'Attendance', href: '/teacher/attendance', icon: CheckSquare },
        { name: 'Resources', href: '/teacher/resources', icon: FileText },
        { name: 'Gallery Upload', href: '/teacher/gallery', icon: Camera },
      ];
    }

    if (user?.role === 'Parent') {
      return [
        ...baseItems,
        { name: 'My Children', href: '/parent/children', icon: Baby },
        { name: 'Attendance', href: '/parent/attendance', icon: CheckSquare },
        { name: 'Resources', href: '/parent/resources', icon: BookOpen },
        { name: 'Gallery', href: '/parent/gallery', icon: Camera },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary text-primary-foreground">
            <h1 className="text-xl font-bold">Sunday School</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user?.profilePictureUrl || '/default-avatar.png'}
                  alt={user?.name}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

