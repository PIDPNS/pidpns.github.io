// Central Supabase client configuration
// This ensures only one Supabase client instance is created

// Supabase configuration
const SUPABASE_URL = 'https://amxvmnzhwehxmnwzzaoy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteHZtbnpod2VoeG1ud3p6YW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NTc5NDksImV4cCI6MjA2NzUzMzk0OX0.Vedmvf0QnCEh5TdgarY48BW2vrBgmYayQ2c-fcKFHlo';

// Global Supabase client instance
let supabaseClient = null;

// Initialize Supabase client (singleton pattern)
function getSupabaseClient() {
  if (!supabaseClient) {
    if (typeof window !== 'undefined' && window.supabase) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('Supabase client initialized');
    } else {
      console.error('Supabase library not loaded');
      return null;
    }
  }
  return supabaseClient;
}

// Export for use in other scripts
window.getSupabaseClient = getSupabaseClient;
