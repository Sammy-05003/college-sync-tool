import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type UserRole = 'student' | 'teacher' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}
