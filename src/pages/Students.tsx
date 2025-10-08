import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, BookOpen, Building2, FilePlus2 } from 'lucide-react';
import { supabase, UserRole } from '@/lib/supabase';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { isLocalAdmin } from '@/lib/roleHelper';
import { toast } from 'sonner';
import { getUserRole } from '@/lib/roleHelper';

interface Student {
  id: string;
  roll_no: string;
  year: number;
  phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  profiles: {
    full_name: string;
    email: string;
  } | null;
  departments: {
    name: string;
    code: string;
  } | null;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface CourseOption {
  id: string;
  course_code: string;
  course_name: string;
}

interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const localAdminActive = typeof window !== 'undefined' && localStorage.getItem('local_admin') === 'true';
  const adminClientAvailable = !!supabaseAdmin;

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Respect local admin bypass
      const localAdmin = (await import('@/lib/roleHelper')).isLocalAdmin();
      if (localAdmin) {
        setUserRole('admin');
      } else if (session?.user) {
        const role = await getUserRole(session.user.id);
        setUserRole(role);
      }

      fetchStudents();
      fetchDepartments();
      fetchCourses();
      fetchStudentProfiles();
    };

    init();
  }, []);

  const fetchStudents = async () => {
    const client = (isLocalAdmin() && supabaseAdmin) ? supabaseAdmin : supabase;
    const { data, error } = await client
      .from('students')
      .select(`
        *,
        profiles:user_id (full_name, email),
        departments:department_id (name, code)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(`Failed to fetch students: ${error.message}`);
      console.error(error);
    } else {
      setStudents(data as Student[]);
    }
  };

  const fetchDepartments = async () => {
    const client = (isLocalAdmin() && supabaseAdmin) ? supabaseAdmin : supabase;
    const { data, error } = await client
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      toast.error(`Failed to fetch departments: ${error.message}`);
    } else {
      setDepartments(data);
    }
  };

  const fetchCourses = async () => {
    const client = (isLocalAdmin() && supabaseAdmin) ? supabaseAdmin : supabase;
    const { data, error } = await client
      .from('courses')
      .select('id, course_code, course_name')
      .order('course_code');

    if (error) {
      // Non-fatal; courses list used for subject/course creation
      console.error(error);
    } else {
      setCourses(data as CourseOption[]);
    }
  };

  const fetchStudentProfiles = async () => {
    const client = (isLocalAdmin() && supabaseAdmin) ? supabaseAdmin : supabase;
    const { data, error } = await client
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student')
      .order('full_name');

    if (error) {
      console.error(error);
    } else {
      setStudentProfiles(data as StudentProfile[]);
    }
  };

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (userRole !== 'admin') {
      toast.error('Only teacher/admin can add students');
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const rollNo = formData.get('roll_no') as string;
    const departmentId = formData.get('department') as string;
    const year = parseInt(formData.get('year') as string);
    const phone = formData.get('phone') as string;

    // For now, we'll create a student record without a user_id
    // In a full implementation, you'd create a user account first
    // If running local admin bypass and admin client available, use admin client
    const client = (isLocalAdmin() && supabaseAdmin) ? supabaseAdmin : supabase;
    const { error } = await client
      .from('students')
      .insert({
        roll_no: rollNo,
        department_id: departmentId,
        year: year,
        phone: phone || null,
      });

    if (error) {
      toast.error(`Failed to add student: ${error.message}`);
      console.error(error);
    } else {
      toast.success('Student added successfully');
      setIsDialogOpen(false);
      fetchStudents();
      (e.target as HTMLFormElement).reset();
    }

    setIsLoading(false);
  };

  const handleAddDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (userRole !== 'admin') {
      toast.error('Only teacher/admin can add departments');
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const name = formData.get('dept_name') as string;
    const code = formData.get('dept_code') as string;

    const client = (isLocalAdmin() && supabaseAdmin) ? supabaseAdmin : supabase;
    const { error } = await client
      .from('departments')
      .insert({ name, code });

    if (error) {
      toast.error(`Failed to add department: ${error.message}`);
      console.error(error);
    } else {
      toast.success('Department added');
      setIsDeptDialogOpen(false);
      fetchDepartments();
      (e.target as HTMLFormElement).reset();
    }

    setIsLoading(false);
  };

  const handleAddCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (userRole !== 'admin') {
      toast.error('Only teacher/admin can add courses');
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const course_code = formData.get('course_code') as string;
    const course_name = formData.get('course_name') as string;
    const credits = parseInt(formData.get('credits') as string);
    const department_id = formData.get('course_department') as string;
    const description = (formData.get('description') as string) || null;

    const client = (isLocalAdmin() && supabaseAdmin) ? supabaseAdmin : supabase;
    const { error } = await client
      .from('courses')
      .insert({ course_code, course_name, credits, department_id, description });

    if (error) {
      toast.error(`Failed to add course: ${error.message}`);
      console.error(error);
    } else {
      toast.success('Course added');
      setIsCourseDialogOpen(false);
      fetchCourses();
      (e.target as HTMLFormElement).reset();
    }

    setIsLoading(false);
  };

  const handleAddSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (userRole !== 'admin') {
      toast.error('Only teacher/admin can add subjects');
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const subject_code = formData.get('subject_code') as string;
    const subject_name = formData.get('subject_name') as string;
    const credits = parseInt(formData.get('subject_credits') as string);
    const department_id = formData.get('subject_department') as string;
    const course_id = (formData.get('subject_course') as string) || null;

    const client = (isLocalAdmin() && supabaseAdmin) ? supabaseAdmin : supabase;
    const { error } = await client
      .from('subjects')
      .insert({ subject_code, subject_name, credits, department_id, course_id });

    if (error) {
      toast.error(`Failed to add subject: ${error.message}`);
      console.error(error);
    } else {
      toast.success('Subject added');
      setIsSubjectDialogOpen(false);
      (e.target as HTMLFormElement).reset();
    }

    setIsLoading(false);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    if (userRole !== 'admin') {
      toast.error('Only teacher/admin can delete students');
      return;
    }

    const client = (isLocalAdmin() && supabaseAdmin) ? supabaseAdmin : supabase;
    const { error } = await client
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error(`Failed to delete student: ${error.message}`);
    } else {
      toast.success('Student deleted successfully');
      fetchStudents();
    }
  };

  // Combine student records with student profiles to show all student accounts
  const combined = (() => {
    const byUserId = new Map<string, Student>();
    for (const s of students) {
      if (s.profiles && (s as any).user_id) {
        byUserId.set((s as any).user_id as string, s);
      }
    }
    const merged: Array<{
      type: 'record' | 'profile';
      student?: Student;
      profile?: StudentProfile;
    }> = [];
    // Existing student records
    for (const s of students) {
      merged.push({ type: 'record', student: s });
    }
    // Profiles without a student record
    for (const p of studentProfiles) {
      if (!byUserId.has(p.id)) {
        merged.push({ type: 'profile', profile: p });
      }
    }
    return merged;
  })();

  const filteredStudents = combined.filter(item => {
    if (item.type === 'record' && item.student) {
      const s = item.student;
      return (
        s.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.departments?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (item.type === 'profile' && item.profile) {
      const p = item.profile;
      return (
        (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return false;
  });

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Students</h1>
            <p className="text-muted-foreground">Manage student records and information</p>
          </div>
          {userRole === 'admin' && (
            <div className="flex gap-2 flex-wrap justify-end">
              {/* Show dev-only banner if local admin is active but service key is missing */}
              {localAdminActive && !adminClientAvailable && (
                <div className="p-2 rounded-md bg-yellow-100 text-yellow-800 mr-2">
                  Local admin mode active, but Supabase service key is missing.
                  Admin writes will be attempted with the regular client and may be blocked by RLS.
                  To enable full admin operations in dev, set VITE_SUPABASE_SERVICE_KEY in your .env file.
                </div>
              )}
              <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="gap-2">
                    <Building2 className="w-4 h-4" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Department</DialogTitle>
                    <DialogDescription>Create a new department</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddDepartment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dept_name">Name</Label>
                      <Input id="dept_name" name="dept_name" placeholder="Computer Science" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dept_code">Code</Label>
                      <Input id="dept_code" name="dept_code" placeholder="CS" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Department'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Course</DialogTitle>
                    <DialogDescription>Create a new course</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCourse} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="course_code">Course Code</Label>
                      <Input id="course_code" name="course_code" placeholder="CS101" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course_name">Course Name</Label>
                      <Input id="course_name" name="course_name" placeholder="Intro to Programming" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="credits">Credits</Label>
                      <Input id="credits" name="credits" type="number" min={1} placeholder="4" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course_department">Department</Label>
                      <Select name="course_department" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name} ({dept.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Input id="description" name="description" placeholder="Short description" />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Course'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <FilePlus2 className="w-4 h-4" />
                    Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Subject</DialogTitle>
                    <DialogDescription>Create a new subject</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddSubject} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject_code">Subject Code</Label>
                      <Input id="subject_code" name="subject_code" placeholder="CS101A" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject_name">Subject Name</Label>
                      <Input id="subject_name" name="subject_name" placeholder="Data Structures" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject_credits">Credits</Label>
                      <Input id="subject_credits" name="subject_credits" type="number" min={1} placeholder="3" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject_department">Department</Label>
                      <Select name="subject_department" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name} ({dept.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject_course">Course (optional)</Label>
                      <Select name="subject_course">
                        <SelectTrigger>
                          <SelectValue placeholder="Select course (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.course_code} - {c.course_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Subject'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>Enter student information below</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="roll_no">Roll Number</Label>
                      <Input id="roll_no" name="roll_no" placeholder="CS2024001" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select name="department" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name} ({dept.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Select name="year" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+1234567890" />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Student'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by roll number, name, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Phone</TableHead>
                    {userRole === 'admin' && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((item, idx) => {
                      if (item.type === 'record' && item.student) {
                        const student = item.student;
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.roll_no}</TableCell>
                            <TableCell>{student.profiles?.full_name || 'N/A'}</TableCell>
                            <TableCell>
                              {student.departments?.name} ({student.departments?.code})
                            </TableCell>
                            <TableCell>Year {student.year}</TableCell>
                            <TableCell>{student.phone || 'N/A'}</TableCell>
                            {userRole === 'admin' && (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon">
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteStudent(student.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      }
                      if (item.type === 'profile' && item.profile) {
                        const p = item.profile;
                        return (
                          <TableRow key={`profile-${p.id}`}>
                            <TableCell className="font-medium">N/A</TableCell>
                            <TableCell>{p.full_name}</TableCell>
                            <TableCell>N/A</TableCell>
                            <TableCell>N/A</TableCell>
                            <TableCell>{p.email}</TableCell>
                            {userRole === 'admin' && (
                              <TableCell className="text-right text-muted-foreground">Account only</TableCell>
                            )}
                          </TableRow>
                        );
                      }
                      return null;
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Students;
