import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { supabase, UserRole } from '@/lib/supabase';

const Dashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    departments: 0
  });
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role as UserRole);
        }

        // Fetch statistics
        const [studentsRes, coursesRes, departmentsRes] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('departments').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          students: studentsRes.count || 0,
          courses: coursesRes.count || 0,
          departments: departmentsRes.count || 0
        });
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Total Students',
      value: stats.students,
      description: 'Enrolled students',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Total Courses',
      value: stats.courses,
      description: 'Available courses',
      icon: BookOpen,
      color: 'text-accent'
    },
    {
      title: 'Departments',
      value: stats.departments,
      description: 'Academic departments',
      icon: GraduationCap,
      color: 'text-primary'
    }
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of the system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {userRole === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:bg-accent/5 transition-colors border-2">
                  <CardContent className="pt-6">
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">Manage Students</h3>
                    <p className="text-sm text-muted-foreground">
                      Add, edit, or remove student records
                    </p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-accent/5 transition-colors border-2">
                  <CardContent className="pt-6">
                    <BookOpen className="h-8 w-8 text-accent mb-2" />
                    <h3 className="font-semibold mb-1">Manage Courses</h3>
                    <p className="text-sm text-muted-foreground">
                      Create and manage course offerings
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {userRole === 'student' && (
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Your academic profile</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View your enrolled courses, attendance, and academic performance.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
