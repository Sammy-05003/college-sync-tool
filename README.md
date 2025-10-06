# 🎓 College Management System

A modern, beautiful, and fully functional College Management System built with React and TypeScript.

## ✨ Features

### 🔐 Role-Based Authentication
- **Admin Dashboard**: Manage students, add marks, subjects, update results, see all activity
- **Student Dashboard**: View grades, attendance, enrolled courses; cannot modify data

### 🤖 Assistant (optional)
- Context-aware chatbot example
- Role-specific guidance and help

### 🎨 Beautiful UI
- Modern gradient design system with purple & cyan accents
- Smooth animations and transitions
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Glassmorphism effects and hover animations

### 📊 Core Functionality
- **Student Management**: Full CRUD operations
- **Course Management**: Browse, search, and filter courses
- **Department Management**: Organize by departments
- **Real-time Updates**: Instant data synchronization
- **Secure Authentication**: Admin bypass plus Supabase auth for students

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Modern web browser

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Start development server**
```bash
npm run dev
```

3. **Access the application**
Open your browser to `http://localhost:5173`

## 👤 Getting Started

### First Time Setup

1. **Create Your Account**
   - Click "Sign Up" tab on the auth page
   - Enter your full name, email, and password (min 6 characters)
   - Account will be auto-confirmed

2. **Roles and Login Model**
   - Admin login is fixed and does not require a Supabase account
   - Admin credentials: id `admin`, password `admin123`
   - Only students can sign up and sign in via email/password
   - Student accounts are automatically assigned the `student` role

3. **Start Exploring**
   - **Admin**: Add students, courses, and departments
   - **Teacher**: View assigned courses and students
   - **Student**: Check your courses and grades

### Using the Assistant 🤖

The AI chatbot appears as a floating purple button in the bottom-right corner:

1. **Click the chat icon** to open the assistant
2. **Ask questions** specific to your role:
   - "Show me all courses in Computer Science"
   - "How do I mark attendance?"
   - "What are my grades?"
   - "Explain how to add a new student"
3. **Get instant help** powered by AI with streaming responses

**AI Features:**
- Context-aware: Knows if you're a student, teacher, or admin
- Streaming responses: See answers appear in real-time
- Smart guidance: Provides role-specific help
- Always available: Float button stays accessible on all pages

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable shadcn UI components
│   ├── Layout.tsx       # Main layout with sidebar navigation
│   ├── Chatbot.tsx      # AI assistant component
│   └── ProtectedRoute.tsx # Auth route protection
├── pages/
│   ├── Auth.tsx         # Login/Signup page
│   ├── Dashboard.tsx    # Main dashboard with stats
│   ├── Students.tsx     # Student management (CRUD)
│   └── Courses.tsx      # Course browsing
├── lib/
│   └── supabase.ts      # Database client & types
└── integrations/
    └── supabase/        # Auto-generated DB types

supabase/
├── functions/
│   └── chat/            # AI chatbot backend (Edge Function)
└── migrations/          # Database schemas & RLS policies
```

## 🎨 Customization

### Design System
All colors and styles are defined in `src/index.css`:

**Color Palette:**
- Primary: Purple gradient (`264deg 70% 58%`)
- Accent: Cyan (`186deg 77% 48%`)
- Gradients: `--gradient-primary`, `--gradient-accent`, `--gradient-hero`
- Shadows: `--shadow-soft`, `--shadow-medium`, `--shadow-glow`

**To customize:**
1. Edit CSS variables in `src/index.css` (both `:root` and `.dark`)
2. Modify gradients, shadows, and colors
3. Both light and dark mode supported

### Adding New Features
1. Create component in `src/components/`
2. Add route in `src/App.tsx`
3. Implement backend logic via Lovable Cloud
4. Update navigation in `src/components/Layout.tsx`

## 🔧 Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: TailwindCSS + shadcn/ui
- **Backend**: Supabase
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: JWT-based secure auth
- **AI**: Optional (Edge Function example)
- **Routing**: React Router v6

## 📱 Responsive Design

Fully responsive across all devices:
- **Mobile**: < 640px - Collapsible sidebar, stacked layout
- **Tablet**: 640px - 1024px - Adaptive sidebar, grid layouts
- **Desktop**: > 1024px - Full sidebar + multi-column content

## 🔒 Security

- **Row Level Security (RLS)** on all database tables
- **Role-based access control** (Admin, Teacher, Student)
- **Secure authentication** with JWT tokens
- **Protected API routes** via Edge Functions
- **Data isolation** per user role

## 🎯 Usage Guide

### For Admins
1. **Setup**: Create departments and courses first
2. **Students**: Add student records with proper enrollment
3. **Teachers**: Create teacher accounts and assign to courses
4. **Reports**: View system-wide statistics on dashboard

### For Teachers
1. **Courses**: Check your assigned courses regularly
2. **Attendance**: Mark student attendance promptly
3. **Materials**: Upload study materials for students
4. **Grades**: Keep student grades updated

### For Students
1. **Dashboard**: Check attendance and grades weekly
2. **Courses**: Browse enrolled courses and materials
3. **AI Help**: Use chatbot for quick questions
4. **Profile**: Keep your information updated

## 🐛 Troubleshooting

### Can't login?
- Ensure email and password are correct
- Check if account exists (try signup if new user)
- Verify email confirmation (auto-confirmed by default)

### AI chatbot not responding?
- Check internet connection
- Ensure Lovable AI is enabled in project
- Look for rate limit errors in browser console

### Data not loading?
- Refresh the page
- Check browser console (F12) for errors
- Verify backend connection in network tab

### Role not showing correct features?
- Admin uses built-in bypass; ensure you used id `admin` with password `admin123`
- Students are restricted to `student` role; they cannot access admin-only routes

## 📝 Environment Variables

Create a `.env` file with:
```env
VITE_SUPABASE_URL=<your-project-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

**Do not commit `.env` to version control!**

## 🚢 Deployment

1. Build: `npm run build`
2. Deploy `dist/` folder to any static host (Vercel, Netlify, etc.)
3. Configure environment variables on hosting platform

## 📞 Support & Resources

**Need help?**
- Review components in `src/components/` and pages in `src/pages/`
- Supabase docs: https://supabase.com/docs

## 🎓 Learning Resources

**Video Tutorials:**
- [Building a Full Stack App with Lovable](https://www.youtube.com/watch?v=9KHLTZaJcR8)
- Complete YouTube playlist available on Lovable channel

**Code Examples:**
- Check `src/components/` for component patterns
- Review `supabase/functions/` for Edge Function examples
- Explore `src/pages/` for page structure

## 📄 License

This project is free to use and modify for personal and commercial projects.

---

Favicon: Updated to display "CMS".

### 🔐 Role-Based Access Summary
- Admin (default): id `admin` / password `admin123`
- Full access: manage students, add marks, subjects, update results, see all activity
- Student: email/password signup and login
- Limited access: view own courses and attendance; cannot modify data

## Project Requirements

- Node.js 18+
- npm or pnpm
- Supabase project with the following environment variables in a `.env` file:
```
VITE_SUPABASE_URL=<your-project-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```
- Run the included migration in `supabase/migrations/` to create tables and policies

## Roles and Login
- Teacher (admin): id `admin`, password `admin123` (no Supabase account required)
- Student: sign up and sign in with email/password (role is `student`)

## Admin Capabilities
- Add Departments, Courses, Subjects, and Students from the `Students` page
- All changes are reflected in the Students section
- Courses page lists all courses (read-only for students)

## Students Visibility
- New student signups appear in the Students page as “Account only” rows until a student record is created
- Admin can convert them by creating a student record (roll number, department, year, etc.)

## Subjects Table
- If your Supabase database does not yet include `subjects`, create it with columns:
  - `id` UUID PK default `gen_random_uuid()`
  - `subject_code` TEXT UNIQUE NOT NULL
  - `subject_name` TEXT NOT NULL
  - `credits` INTEGER NOT NULL
  - `department_id` UUID REFERENCES `departments(id)`
  - `course_id` UUID NULL REFERENCES `courses(id)`
  - timestamps (`created_at`, `updated_at`)
- RLS/policies: allow SELECT to authenticated users; allow INSERT/UPDATE/DELETE to admin only
