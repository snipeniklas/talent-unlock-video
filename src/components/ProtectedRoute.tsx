import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData, useUserRole } from '@/hooks/useUserData';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'company_admin' | 'user';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { data: userData, isLoading } = useUserData();
  const userRole = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    // Check if user is authenticated
    if (!userData?.user) {
      navigate('/auth');
      return;
    }

    // Check if user has required role
    if (requiredRole) {
      // Admin always has access to everything
      if (userRole === 'admin') {
        return;
      }

      // Check if user has the specific required role
      if (userRole !== requiredRole) {
        toast({
          title: 'Keine Berechtigung',
          description: 'Sie haben keine Berechtigung für diesen Bereich.',
          variant: 'destructive',
        });
        navigate('/app/dashboard');
        return;
      }
    }
  }, [userData, userRole, requiredRole, isLoading, navigate]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children until auth is verified
  if (!userData?.user) {
    return null;
  }

  // Don't render if role check fails
  if (requiredRole && userRole !== 'admin' && userRole !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};
