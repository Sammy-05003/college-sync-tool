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
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profiles:user_id (full_name, email),
        departments:department_id (name, code)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch students');
      console.error(error);
    } else {
      setStudents(data as Student[]);
    }
  };

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      toast.error('Failed to fetch departments');
    } else {
      setDepartments(data);
    }
  };

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const rollNo = formData.get('roll_no') as string;
    const departmentId = formData.get('department') as string;
    const year = parseInt(formData.get('year') as string);
    const phone = formData.get('phone') as string;

    // For now, we'll create a student record without a user_id
    // In a full implementation, you'd create a user account first
    const { error } = await supabase
      .from('students')
      .insert({
        roll_no: rollNo,
        department_id: departmentId,
        year: year,
        phone: phone || null,
      });

    if (error) {
      toast.error('Failed to add student');
      console.error(error);
    } else {
      toast.success('Student added successfully');
      setIsDialogOpen(false);
      fetchStudents();
      (e.target as HTMLFormElement).reset();
    }

    setIsLoading(false);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete student');
    } else {
      toast.success('Student deleted successfully');
      fetchStudents();
    }
  };

  const filteredStudents = students.filter(student =>
    student.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.profiles?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.departments?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Students</h1>
            <p className="text-muted-foreground">Manage student records and information</p>
          </div>
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
                    <TableHead className="text-right">Actions</TableHead>
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
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.roll_no}</TableCell>
                        <TableCell>{student.profiles?.full_name || 'N/A'}</TableCell>
                        <TableCell>
                          {student.departments?.name} ({student.departments?.code})
                        </TableCell>
                        <TableCell>Year {student.year}</TableCell>
                        <TableCell>{student.phone || 'N/A'}</TableCell>
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
                      </TableRow>
                    ))
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
