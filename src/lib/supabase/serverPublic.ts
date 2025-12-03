// src/lib/supabase/serverPublic.ts
import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerPublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
