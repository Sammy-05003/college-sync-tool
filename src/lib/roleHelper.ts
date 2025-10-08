import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "./supabase";

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
  
  return data?.role as UserRole || null;
}

export async function checkUserRole(userId: string, role: UserRole): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking user role:', error);
    return false;
  }
  
  return !!data;
}
