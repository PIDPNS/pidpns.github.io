// Central Supabase client configuration
// This ensures only one Supabase client instance is created

// Supabase configuration
const SUPABASE_URL = 'https://amxvmnzhwehxmnwzzaoy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteHZtbnpod2VoeG1ud3p6YW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NTc5NDksImV4cCI6MjA2NzUzMzk0OX0.Vedmvf0QnCEh5TdgarY48BW2vrBgmYayQ2c-fcKFHlo';

// Global Supabase client instance - STRICT SINGLETON
let supabaseClient = null;
let isClientInitialized = false;

// Check if we already have a global client
if (window._globalSupabaseClient) {
  supabaseClient = window._globalSupabaseClient;
  isClientInitialized = true;
}

// Initialize Supabase client (strict singleton pattern)
function getSupabaseClient() {
  // Return existing client if already initialized
  if (isClientInitialized && supabaseClient) {
    return supabaseClient;
  }
  
  // Check for existing global client first
  if (window._globalSupabaseClient) {
    supabaseClient = window._globalSupabaseClient;
    isClientInitialized = true;
    return supabaseClient;
  }
  
  if (typeof window !== 'undefined' && window.supabase && !isClientInitialized) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      isClientInitialized = true;
      
      // Store globally to prevent multiple instances
      window._globalSupabaseClient = supabaseClient;
      
      console.log('Supabase client initialized (strict singleton)');
      return supabaseClient;
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return null;
    }
  } else if (isClientInitialized) {
    return supabaseClient;
  } else {
    console.error('Supabase library not loaded');
    return null;
  }
}

// Reset function for development/testing
function resetSupabaseClient() {
  supabaseClient = null;
  isClientInitialized = false;
  // Also clear the global reference
  if (window._globalSupabaseClient) {
    delete window._globalSupabaseClient;
  }
}

// Export for use in other scripts
window.getSupabaseClient = getSupabaseClient;
window.resetSupabaseClient = resetSupabaseClient;
