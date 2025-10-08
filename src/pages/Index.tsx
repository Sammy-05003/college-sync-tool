import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Users, TrendingUp, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              College CMS
            </span>
          </div>
          <Link to="/auth">
            <Button className="shadow-lg hover:shadow-xl transition-all hover:scale-105" style={{ background: "var(--gradient-primary)" }}>
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Modern Education
              </span>
              <br />
              <span className="text-foreground">Management System</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "100ms" }}>
              Streamline your institution's operations with our comprehensive management platform.
              Manage students, track attendance, organize courses, and collaborate seamlessly.
            </p>
            <div className="flex gap-4 justify-center animate-fade-in" style={{ animationDelay: "200ms" }}>
              <Link to="/auth">
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-all hover:scale-105 text-lg px-8" style={{ background: "var(--gradient-primary)" }}>
                  Sign In <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="p-8 rounded-2xl border-2 bg-card/50 backdrop-blur hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--gradient-primary)" }}>
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Student Management</h3>
                <p className="text-muted-foreground">
                  Efficiently manage student records, attendance, and academic performance
                </p>
              </div>
              <div className="p-8 rounded-2xl border-2 bg-card/50 backdrop-blur hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--gradient-accent)" }}>
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Course Organization</h3>
                <p className="text-muted-foreground">
                  Create and manage courses, subjects, and academic departments with ease
                </p>
              </div>
              <div className="p-8 rounded-2xl border-2 bg-card/50 backdrop-blur hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, hsl(280 70% 65%), hsl(300 70% 70%))" }}>
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
                <p className="text-muted-foreground">
                  Get instant help with our intelligent AI chatbot for students and teachers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 text-center text-muted-foreground backdrop-blur-sm">
          <p>&copy; 2025 College CMS. Built with modern technology.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
