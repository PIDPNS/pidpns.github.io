// Authentication utility for PIDPNS Digital Backdrop
// This script handles user authentication and session management

class AuthManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentUser = null;
    this.isInitialized = false;
    this.authListenerSetup = false;
  }

  // Initialize authentication
  async init() {
    try {
      // Prevent multiple initializations
      if (this.isInitialized) {
        return this.currentUser !== null;
      }

      // Get current session without triggering auth state changes
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('Auth initialization error:', error);
        return false;
      }

      if (session && session.user) {
        this.currentUser = session.user;
        this.isInitialized = true;
        
        // Only set up auth listener once
        if (!this.authListenerSetup) {
          this.setupAuthListener();
        }
        
        return true;
      } else {
        // No valid session
        return false;
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      return false;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.isInitialized && this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get user display name
  getUserDisplayName() {
    if (!this.currentUser) return 'Guest';
    
    return this.currentUser.user_metadata?.full_name || 
           this.currentUser.user_metadata?.name || 
           this.currentUser.email || 
           'User';
  }

  // Get user email
  getUserEmail() {
    return this.currentUser?.email || '';
  }

  // Get user avatar URL
  getUserAvatar() {
    return this.currentUser?.user_metadata?.avatar_url || 
           this.currentUser?.user_metadata?.picture || 
           null;
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }

      // Clear local data
      this.currentUser = null;
      this.isInitialized = false;
      
      // Clear any remember me preference
      localStorage.removeItem('pidpns_remember_login');
      
      // Redirect to login
      this.redirectToLogin();
      
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  }

  // Redirect to login page
  redirectToLogin() {
    // Avoid infinite redirect loops
    if (window.location.pathname.endsWith('/login.html')) {
      return;
    }
    
    // Smooth redirect
    window.location.href = 'login.html';
  }

  // Set up auth state change listener (only once)
  setupAuthListener() {
    if (this.authListenerSetup) {
      return; // Prevent multiple listeners
    }
    
    this.authListenerSetup = true;
    
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      switch (event) {
        case 'SIGNED_IN':
          if (!this.currentUser || this.currentUser.id !== session?.user?.id) {
            this.currentUser = session?.user || null;
            this.isInitialized = true;
            console.log('User authenticated:', this.currentUser?.email);
          }
          break;
          
        case 'SIGNED_OUT':
          this.currentUser = null;
          this.isInitialized = false;
          this.redirectToLogin();
          break;
          
        case 'TOKEN_REFRESHED':
          if (session?.user) {
            this.currentUser = session.user;
          }
          break;
          
        case 'INITIAL_SESSION':
          // Handle initial session silently, already processed in init()
          break;
          
        default:
          console.log('Unhandled auth event:', event);
      }
    });
  }

  // Update UI elements with user info
  updateUI() {
    const userDisplayElements = document.querySelectorAll('.user-display-name');
    const userEmailElements = document.querySelectorAll('.user-email');
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    
    const displayName = this.getUserDisplayName();
    const email = this.getUserEmail();
    const avatarUrl = this.getUserAvatar();
    
    userDisplayElements.forEach(el => {
      el.textContent = displayName;
    });
    
    userEmailElements.forEach(el => {
      el.textContent = email;
    });
    
    userAvatarElements.forEach(el => {
      if (avatarUrl) {
        el.src = avatarUrl;
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    });
  }

  // Check if user has specific permissions (placeholder for future use)
  hasPermission(permission) {
    if (!this.isAuthenticated()) return false;
    
    // For now, all authenticated users have all permissions
    // This can be extended with role-based access control
    return true;
  }

  // Get user metadata
  getUserMetadata() {
    return this.currentUser?.user_metadata || {};
  }

  // Refresh session
  async refreshSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      this.currentUser = session?.user || null;
      return session;
      
    } catch (error) {
      console.error('Failed to refresh session:', error);
      this.redirectToLogin();
      return null;
    }
  }
}

// Set up sign out buttons
function setupSignOutButtons() {
  const signOutButtons = document.querySelectorAll('.sign-out-btn, [data-action="sign-out"]');
  
  signOutButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      
      try {
        button.disabled = true;
        button.textContent = 'Signing out...';
        
        if (globalAuthManager) {
          await globalAuthManager.signOut();
        }
        
      } catch (error) {
        console.error('Sign out failed:', error);
        alert('Failed to sign out. Please try again.');
        button.disabled = false;
        button.textContent = 'Sign Out';
      }
    });
  });
}

// Create user menu for authenticated users
function createUserMenu() {
  if (!globalAuthManager || !globalAuthManager.isAuthenticated()) return;
  
  const userMenuHtml = `
    <div class="user-menu">
      <div class="user-info">
        <img class="user-avatar" src="" alt="User Avatar" style="display: none; width: 32px; height: 32px; border-radius: 50%;">
        <div class="user-details">
          <div class="user-display-name">${globalAuthManager.getUserDisplayName()}</div>
          <div class="user-email">${authManager.getUserEmail()}</div>
        </div>
      </div>
      <button class="sign-out-btn" data-action="sign-out">Sign Out</button>
    </div>
  `;
  
  return userMenuHtml;
}

// Protection wrapper for page content
function protectPage() {
  // Show loading state
  document.body.style.opacity = '0.5';
  document.body.style.pointerEvents = 'none';
  
  // Create loading overlay
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'auth-loading';
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    color: white;
    font-family: Inter, sans-serif;
  `;
  loadingOverlay.innerHTML = `
    <div style="text-align: center;">
      <div style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #34C759; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
      <div>Verifying authentication...</div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  
  document.body.appendChild(loadingOverlay);
  
  return () => {
    // Remove loading overlay and restore page
    if (loadingOverlay && loadingOverlay.parentNode) {
      loadingOverlay.parentNode.removeChild(loadingOverlay);
    }
    document.body.style.opacity = '';
    document.body.style.pointerEvents = '';
  };
}

// Export for use in other scripts
// Global auth manager instance (singleton)
let globalAuthManager = null;

// Initialize authentication with singleton pattern
async function initializeAuth(supabaseClient) {
  try {
    // Use existing global auth manager or create new one
    if (!globalAuthManager) {
      globalAuthManager = new AuthManager(supabaseClient);
      // Make it globally available immediately
      window.authManager = globalAuthManager;
      window.globalAuthManager = globalAuthManager;
    }
    
    const isAuthenticated = await globalAuthManager.init();
    
    if (isAuthenticated) {
      console.log('User authenticated:', globalAuthManager.getCurrentUser()?.email);
      // Ensure global access is still available after init
      window.authManager = globalAuthManager;
    }
    
    return isAuthenticated;
  } catch (error) {
    console.error('Authentication initialization failed:', error);
    return false;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager, initializeAuth, protectPage, createUserMenu };
}
