import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [studentId, setStudentId] = useState<string>('');

  useEffect(() => {
    fetchStudentIdAndNotes();
  }, []);

  const fetchStudentIdAndNotes = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Get student ID from students table
    const { data: studentData } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (studentData) {
      setStudentId(studentData.id);
      fetchNotes(studentData.id);
    }
  };

  const fetchNotes = async (studId: string) => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('student_id', studId)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch notes');
    } else {
      setNotes(data || []);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !studentId) {
      toast.error('Please fill in all fields');
      return;
    }

    if (editingNote) {
      const { error } = await supabase
        .from('notes')
        .update({ title, content })
        .eq('id', editingNote.id);

      if (error) {
        toast.error('Failed to update note');
      } else {
        toast.success('Note updated successfully');
        fetchNotes(studentId);
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('notes')
        .insert({ student_id: studentId, title, content });

      if (error) {
        toast.error('Failed to create note');
      } else {
        toast.success('Note created successfully');
        fetchNotes(studentId);
        resetForm();
      }
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete note');
    } else {
      toast.success('Note deleted successfully');
      fetchNotes(studentId);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingNote(null);
    setIsDialogOpen(false);
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Notes</h1>
            <p className="text-muted-foreground">Your personal study diary</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter note title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your notes here..."
                    rows={8}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button onClick={handleSave}>
                    {editingNote ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {notes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No notes yet</h3>
              <p className="text-muted-foreground mb-4">Start creating your study notes!</p>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(note.updated_at), 'PPp')}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {note.content || 'No content'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(note)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notes;
