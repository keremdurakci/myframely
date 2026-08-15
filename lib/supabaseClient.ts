import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase instance (anon key, RLS-enforced).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
