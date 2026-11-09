/**
 * Supabase client for VYRON
 *
 * Setup:
 * 1. Create project at https://supabase.com
 * 2. Copy Project URL + anon key into .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL=...
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 * 3. Run the SQL schema (see docs/supabase-schema.sql)
 * 4. Enable Email auth in Supabase Dashboard → Authentication
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}

export const isSupabaseConfigured = () => Boolean(url && key);
