import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
  description: string | null;
  departments: {
    name: string;
    code: string;
  } | null;
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        departments:department_id (name, code)
      `)
      .order('course_code');

    if (error) {
      toast.error('Failed to fetch courses');
      console.error(error);
    } else {
      setCourses(data as Course[]);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.departments?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Courses</h1>
          <p className="text-muted-foreground">Browse all available courses</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center text-muted-foreground">
                No courses found
              </CardContent>
            </Card>
          ) : (
            filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{course.course_name}</CardTitle>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {course.credits} Credits
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    {course.course_code} • {course.departments?.name}
                  </CardDescription>
                </CardHeader>
                {course.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {course.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Courses;
