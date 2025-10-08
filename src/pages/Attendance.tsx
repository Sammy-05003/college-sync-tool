import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/lib/supabase';
import { getUserRole } from '@/lib/roleHelper';
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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const role = await getUserRole(session.user.id);
    setUserRole(role || '');

    const [{ data: studentData }, { data: subjectData }] = await Promise.all([
      supabase
        .from('students')
        .select('id, roll_no, user_id, profiles:user_id(full_name)'),
      supabase
        .from('subjects')
        .select('id, subject_name, subject_code')
    ]);

    if (studentData) setStudents(studentData as Student[]);
    if (subjectData) setSubjects(subjectData);
  };

  const fetchAttendance = async () => {
    if (!selectedSubject) return;

    const { data } = await supabase
      .from('attendance')
      .select('student_id, status')
      .eq('subject_id', selectedSubject)
      .eq('date', format(selectedDate, 'yyyy-MM-dd'));

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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    setLoading(true);
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
