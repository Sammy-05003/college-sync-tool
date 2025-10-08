import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ClipboardCheck,
  BookMarked
} from 'lucide-react';
import { supabase, UserRole } from '@/lib/supabase';
import { toast } from 'sonner';
import { Chatbot } from '@/components/Chatbot';
import { getUserRole } from '@/lib/roleHelper';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const [role, { data: profile }] = await Promise.all([
          getUserRole(session.user.id),
          supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single()
        ]);
        
        if (role) setUserRole(role);
        if (profile) setUserName(profile.full_name);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate('/auth');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
    { name: 'Students', href: '/students', icon: Users, roles: ['admin', 'teacher'] },
    { name: 'Courses', href: '/courses', icon: BookOpen, roles: ['admin', 'teacher', 'student'] },
    { name: 'Attendance', href: '/attendance', icon: ClipboardCheck, roles: ['admin', 'teacher', 'student'] },
    { name: 'My Notes', href: '/notes', icon: BookMarked, roles: ['student'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-sidebar-background border-r border-sidebar-border transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">College CMS</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    !sidebarOpen ? 'px-2' : ''
                  } ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <item.icon className="w-5 h-5 min-w-[20px]" />
                  {sidebarOpen && <span className="ml-3">{item.name}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          {sidebarOpen && userName && (
            <div className="px-3 py-2 text-sm">
              <p className="font-medium text-sidebar-foreground">{userName}</p>
              <p className="text-xs text-sidebar-foreground/70 capitalize">{userRole}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${
              !sidebarOpen ? 'px-2' : ''
            }`}
          >
            <LogOut className="w-5 h-5 min-w-[20px]" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      
      <Chatbot />
    </div>
  );
};

export default Layout;
