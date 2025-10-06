import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, UserRole } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const ADMIN_BYPASS_KEY = 'cms_admin_bypass';

  useEffect(() => {
    const checkAuth = async () => {
      // Admin bypass: if flag is set, pretend admin is logged in
      if (localStorage.getItem(ADMIN_BYPASS_KEY) === 'true') {
        setUser({} as User);
        setUserRole('admin');
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // Fetch user profile to get role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role as UserRole);
        }
      }
      
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (localStorage.getItem(ADMIN_BYPASS_KEY) === 'true') {
        setUser({} as User);
        setUserRole('admin');
        return;
      }
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUserRole(profile.role as UserRole);
          }
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
