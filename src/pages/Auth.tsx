import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { GraduationCap } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const ADMIN_BYPASS_KEY = 'cms_admin_bypass';

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('signin-email') as string;
    const password = formData.get('signin-password') as string;

    try {
      // Admin bypass: username 'admin' and password 'admin123'
      if (email === 'admin' && password === 'admin123') {
        localStorage.setItem(ADMIN_BYPASS_KEY, 'true');
        toast.success('Logged in as Admin');
        navigate('/dashboard');
        return;
      }

      emailSchema.parse(email);
      passwordSchema.parse(password);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(error.message);
      } else {
        // Enforce student-only login via Supabase accounts
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profile?.role && profile.role !== 'student') {
            await supabase.auth.signOut();
            toast.error('Only students can sign in. Use admin/admin123 for admin.');
            return;
          }
        }

        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('signup-name') as string;
    const email = formData.get('signup-email') as string;
    const password = formData.get('signup-password') as string;

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      if (!fullName || fullName.trim().length < 2) {
        toast.error('Please enter your full name');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            role: 'student'
          }
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Redirecting...');
        navigate('/dashboard');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-2xl transition-all hover:scale-110" style={{ background: "var(--gradient-primary)" }}>
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">College Management System</h1>
          <p className="text-muted-foreground text-center text-lg">Modern education management platform</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 backdrop-blur">
            <TabsTrigger value="signin" className="data-[state=active]:shadow-lg">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:shadow-lg">Student Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="border-2 shadow-2xl backdrop-blur-sm bg-card/95">
              <CardHeader className="space-y-3">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email or Admin ID</Label>
                    <Input
                      id="signin-email"
                      name="signin-email"
                      type="text"
                      placeholder="student@college.edu or admin"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="signin-password"
                      type="password"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full shadow-lg hover:shadow-xl transition-all hover:scale-105" 
                    style={{ background: "var(--gradient-primary)" }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-2 shadow-2xl backdrop-blur-sm bg-card/95">
              <CardHeader className="space-y-3">
                <CardTitle className="text-2xl">Get Started</CardTitle>
                <CardDescription>Create your account in seconds</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="signup-name"
                      type="text"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="signup-email"
                      type="email"
                      placeholder="student@college.edu"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="signup-password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full shadow-lg hover:shadow-xl transition-all hover:scale-105" 
                    style={{ background: "var(--gradient-primary)" }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
