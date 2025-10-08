import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY as string | undefined;

export const supabaseAdmin = (url && serviceKey)
  ? createClient(url, serviceKey)
  : null;

export default supabaseAdmin;
