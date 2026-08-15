import { createClient } from "@supabase/supabase-js";

// Server-side Supabase instance — only import from API routes, never from
// client components. The service role key bypasses RLS, so every write
// through this client must be validated by hand.
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
