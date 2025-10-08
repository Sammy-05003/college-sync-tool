import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/lib/supabase';
import { getUserRole, isLocalAdmin } from '@/lib/roleHelper';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  roll_no: string;
  user_id: string | null;
  profiles: {
    full_name: string;
  } | null;
}

interface Subject {
  id: string;
  subject_name: string;
  subject_code: string;
}

interface AttendanceRecord {
  student_id: string;
  status: 'present' | 'absent' | 'late';
}

const Attendance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentRecordId, setStudentRecordId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const localAdminActive = typeof window !== 'undefined' && localStorage.getItem('local_admin') === 'true';
  const adminClientAvailable = !!supabaseAdmin;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    const localAdmin = isLocalAdmin();

    // Fetch subjects (available to all authenticated users)
    const client = (localAdmin && supabaseAdmin) ? supabaseAdmin : supabase;
    const { data: subjectData } = await client
      .from('subjects')
      .select('id, subject_name, subject_code');

    if (subjectData) setSubjects(subjectData);

    // Local admin: show admin/teacher view without Supabase session
    if (localAdmin) {
      setUserRole('admin');
      const client2 = (localAdmin && supabaseAdmin) ? supabaseAdmin : supabase;
      const { data: studentData } = await client2
        .from('students')
        .select('id, roll_no, user_id, profiles:user_id(full_name)');

      if (studentData) setStudents(studentData as Student[]);
      return;
    }

    // If there's no Supabase session and not a local admin, nothing more to do
    if (!session?.user) return;

    const role = await getUserRole(session.user.id);
    setUserRole(role || '');

    // If the user is a student, only fetch their student record so they cannot see others
    if (role === 'student') {
      const { data: studentData, error } = await supabase
        .from('students')
        .select('id, roll_no, user_id, profiles:user_id(full_name)')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching student record for student:', error);
      }

      if (studentData) {
        setStudents([studentData as Student]);
        setStudentRecordId((studentData as Student).id);
      } else {
        setStudents([]);
        setStudentRecordId(null);
      }
    } else {
      // teacher/admin: fetch all students
      const { data: studentData } = await supabase
        .from('students')
        .select('id, roll_no, user_id, profiles:user_id(full_name)');

      if (studentData) setStudents(studentData as Student[]);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedSubject) return;

    let query = supabase
      .from('attendance')
      .select('student_id, status')
      .eq('subject_id', selectedSubject)
      .eq('date', format(selectedDate, 'yyyy-MM-dd'));

    // If student, only fetch their own attendance (RLS will also enforce this server-side)
    if (userRole === 'student' && studentRecordId) {
      query = (query as any).eq('student_id', studentRecordId);
    }

    const { data } = await query;

    if (data) {
      setAttendance(data as AttendanceRecord[]);
    } else {
      setAttendance([]);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      fetchAttendance();
    }
  }, [selectedSubject, selectedDate]);

  const updateAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    // Only teachers or admins should be able to update attendance. Double-check client-side.
    if (!(userRole === 'teacher' || userRole === 'admin')) {
      toast.error('You are not authorized to update attendance');
      return;
    }

    setLoading(true);

    // If local admin bypass and admin client exists, use admin client to upsert
    if (localAdminActive && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('attendance')
        .upsert({
          student_id: studentId,
          subject_id: selectedSubject,
          date: format(selectedDate, 'yyyy-MM-dd'),
          status,
          marked_by: null
        }, { onConflict: 'student_id,subject_id,date' });

      if (error) {
        toast.error('Failed to update attendance');
      } else {
        toast.success('Attendance updated');
        fetchAttendance();
      }
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error('No active session');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('attendance')
      .upsert({
        student_id: studentId,
        subject_id: selectedSubject,
        date: format(selectedDate, 'yyyy-MM-dd'),
        status,
        marked_by: session.user.id
      }, {
        onConflict: 'student_id,subject_id,date'
      });

    if (error) {
      toast.error('Failed to update attendance');
    } else {
      toast.success('Attendance updated');
      fetchAttendance();
    }
    setLoading(false);
  };

  const getStatus = (studentId: string) => {
    return attendance.find(a => a.student_id === studentId)?.status || 'absent';
  };

  const isTeacher = userRole === 'teacher' || userRole === 'admin';

  return (
    <Layout>
      <div className="p-8">
        {localAdminActive && !adminClientAvailable && (
          <div className="mb-4 p-3 rounded-md bg-yellow-100 text-yellow-800">
            Local admin mode active but Supabase service key (VITE_SUPABASE_SERVICE_KEY) is not set.
            Admin writes or reads may be blocked by RLS. Set the service key in `.env` to enable full admin features.
          </div>
        )}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">Attendance Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.subject_code} - {subject.subject_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedSubject && (
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {students.map(student => {
                  const status = getStatus(student.id);
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{student.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">Roll No: {student.roll_no}</p>
                      </div>
                      {isTeacher ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={status === 'present' ? 'default' : 'outline'}
                            onClick={() => updateAttendance(student.id, 'present')}
                            disabled={loading}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={status === 'late' ? 'default' : 'outline'}
                            onClick={() => updateAttendance(student.id, 'late')}
                            disabled={loading}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Late
                          </Button>
                          <Button
                            size="sm"
                            variant={status === 'absent' ? 'destructive' : 'outline'}
                            onClick={() => updateAttendance(student.id, 'absent')}
                            disabled={loading}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Absent
                          </Button>
                        </div>
                      ) : (
                        <div className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium",
                          status === 'present' && "bg-green-100 text-green-700",
                          status === 'late' && "bg-yellow-100 text-yellow-700",
                          status === 'absent' && "bg-red-100 text-red-700"
                        )}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Attendance;
