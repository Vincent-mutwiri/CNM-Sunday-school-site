import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  console.log('ProtectedRoute:', {
    status,
    pathname,
    session: session ? { user: { role: session.user?.role } } : 'No session',
    allowedRoles
  });

  useEffect(() => {
    console.log('ProtectedRoute effect running:', { status, pathname });
    
    if (status === 'unauthenticated') {
      console.log('User not authenticated, redirecting to login');
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || '/')}`);
    } else if (status === 'authenticated') {
      console.log('User is authenticated, checking roles:', {
        userRole: session?.user?.role,
        allowedRoles,
        hasAccess: allowedRoles ? allowedRoles.includes(session?.user?.role || '') : true
      });
      
      if (allowedRoles && !allowedRoles.includes(session?.user?.role || '')) {
        console.log('User role not allowed, redirecting to unauthorized');
        router.push('/unauthorized');
      }
    }
  }, [status, session, router, allowedRoles, pathname]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || (status === 'authenticated' && allowedRoles && !allowedRoles.includes(session?.user?.role || ''))) {
    return null; // Will be redirected by the useEffect
  }

  return <>{children}</>;
}
