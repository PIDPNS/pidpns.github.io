// Central Supabase client configuration
// This ensures only one Supabase client instance is created

// Supabase configuration
const SUPABASE_URL = 'https://amxvmnzhwehxmnwzzaoy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteHZtbnpod2VoeG1ud3p6YW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NTc5NDksImV4cCI6MjA2NzUzMzk0OX0.Vedmvf0QnCEh5TdgarY48BW2vrBgmYayQ2c-fcKFHlo';

// Global Supabase client instance
let supabaseClient = null;
let isClientInitialized = false;

// Initialize Supabase client (singleton pattern)
function getSupabaseClient() {
  // Prevent multiple initializations
  if (isClientInitialized && supabaseClient) {
    return supabaseClient;
  }
  
  if (typeof window !== 'undefined' && window.supabase && !isClientInitialized) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      isClientInitialized = true;
      console.log('Supabase client initialized (singleton)');
      return supabaseClient;
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return null;
    }
  } else if (isClientInitialized) {
    return supabaseClient;
  } else {
    console.error('Supabase library not loaded or client already initialized');
    return null;
  }
}

// Reset function for development/testing
function resetSupabaseClient() {
  supabaseClient = null;
  isClientInitialized = false;
}

// Export for use in other scripts
window.getSupabaseClient = getSupabaseClient;
window.resetSupabaseClient = resetSupabaseClient;
