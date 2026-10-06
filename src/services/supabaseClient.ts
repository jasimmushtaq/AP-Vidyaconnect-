// ============================================================================
// AP VIDYACONNECT — SUPABASE CLIENT INITIALIZATION
// ============================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://zkcgaxgrbrcykcmgmsnp.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_EUXHBVrOeki_EDgCPhw6Qw_SyVtb6gy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
