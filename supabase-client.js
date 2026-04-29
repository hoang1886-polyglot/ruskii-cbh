// ─── SUPABASE CLIENT ─────────────────────────────────────────
// Replace these values with your own from https://supabase.com
// Project Settings → API → Project URL & anon key

const SUPABASE_URL  = 'YOUR_SUPABASE_URL';   // e.g. https://hsbzoqktrkpxhqenoifp.supabase.co
const SUPABASE_ANON = 'YOUR_SUPABASE_ANON_KEY'; // long string starting with "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYnpvcWt0cmtweGhxZW5vaWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MDY0MTQsImV4cCI6MjA5Mjk4MjQxNH0.ZRzI-vW4Cf3SSzjzGuJ81mZ4d_TaSfM3zDHIsEyE9_o"

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// Make globally available
window._supabase = _supabase;
