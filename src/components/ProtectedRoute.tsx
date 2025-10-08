import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, UserRole } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { getUserRole, isLocalAdmin } from '@/lib/roleHelper';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // First, check for local admin bypass
      const isLocalAdmin = typeof window !== 'undefined' && localStorage.getItem('local_admin') === 'true';
      if (isLocalAdmin) {
        setUser({} as any); // mark as authenticated (not a Supabase user)
        setUserRole('admin');
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        const role = await getUserRole(session.user.id);
        setUserRole(role);
      }

      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // If local admin bypass is active, don't let Supabase subscription overwrite it
      if (typeof window !== 'undefined' && isLocalAdmin()) {
        // ensure we remain as admin
        setUser({} as any);
        setUserRole('admin');
        return;
      }

      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const role = await getUserRole(session.user.id);
          setUserRole(role);
        }, 0);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
