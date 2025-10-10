import { supabase, TABLES, isSupabaseConfigured } from './supabaseClient.js';

// Lazy-load Tauri plugins for haptic feedback and notifications
let pluginsCache = null;

/**
 * Get Tauri plugins with lazy loading and caching
 * Returns no-op functions in web/SSR environments
 */
async function getPlugins() {
  if (pluginsCache) {
    return pluginsCache;
  }

  if (typeof window === 'undefined') {
    // SSR environment - return no-ops
    pluginsCache = {
      triggerHaptic: () => {},
      showNotification: () => Promise.resolve()
    };
    return pluginsCache;
  }

  try {
    // Dynamic import for Tauri environment
    const { useTauriPlugins } = await import('@/composables/useTauriPlugins');
    pluginsCache = useTauriPlugins();
    return pluginsCache;
  } catch (error) {
    // Fallback for web environment or if import fails
    console.log('[AuthService] Running in web mode, plugin features disabled');
    pluginsCache = {
      triggerHaptic: () => {},
      showNotification: () => Promise.resolve()
    };
    return pluginsCache;
  }
}

class AuthService {
  constructor() {
    this.currentUser = null;
    this.currentProfile = null;
  }

  /**
   * Get platform-aware redirect URL for authentication callbacks
   * Detects Tauri mobile platforms (iOS/Android) and returns appropriate URL scheme
   * @param {string} path - The path to redirect to (e.g., '/auth/callback')
   * @returns {string} Platform-specific redirect URL
   */
  getRedirectUrl(path) {
    // Check if running on Tauri mobile platform (iOS or Android)
    const isTauriMobile = this.isTauriMobilePlatform();
    
    if (isTauriMobile) {
      // Mobile: use custom URL scheme from environment variables
      const mobileScheme = import.meta.env.VITE_MOBILE_SCHEME || 'switchfit';
      return `${mobileScheme}:/${path}`; // Format: switchfit://auth/callback
    } else {
      // Desktop/Web: use window origin
      return `${window.location.origin}${path}`;
    }
  }

  /**
   * Detect if running on Tauri mobile platform (iOS or Android)
   * @returns {boolean} True if running on iOS or Android via Tauri
   */
  isTauriMobilePlatform() {
    // Check if Tauri API is available
    if (!window.__TAURI__) {
      return false;
    }
    
    // Attempt to detect platform using Tauri internals
    try {
      const platform = window.__TAURI_INTERNALS__?.plugins?.os?.platform;
      return platform === 'ios' || platform === 'android';
    } catch (error) {
      // Fallback: check if mobile scheme is configured (less reliable)
      console.warn('[AuthService] Could not detect Tauri platform, falling back to scheme check:', error);
      return !!import.meta.env.VITE_MOBILE_SCHEME;
    }
  }

  /**
   * Sign up a new user using Supabase Auth
   */
  async signUp(email, password, username = '', fullName = '') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          },
        },
      });

      if (error) throw error;

      // Trigger success feedback
      const plugins = await getPlugins();
      plugins.triggerHaptic('notification', 'success');
      await plugins.showNotification('Welcome!', 'Please check your email to verify your account');

      return {
        success: true,
        user: data.user,
        message: 'Please check your email to confirm your account',
      };
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Trigger error feedback
      const plugins = await getPlugins();
      plugins.triggerHaptic('notification', 'error');
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign in using Supabase Auth
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      this.currentUser = data.user;

      // Initialize user credits if they don't exist
      await this.initializeUserCredits();

      // Get credit balance to show in welcome message
      let creditCount = 0;
      try {
        const { default: creditService } = await import('./creditService.js');
        console.log('[AuthService] Credit service imported successfully');
        const result = await creditService.getCreditBalance();
        console.log('[AuthService] Credit balance result:', result);
        if (result.success) {
          creditCount = result.credits;
          console.log('[AuthService] Credits loaded:', creditCount);
        } else {
          console.warn('[AuthService] Failed to get credits:', result.error);
        }
      } catch (error) {
        console.error('[AuthService] Error loading credits for welcome message:', error);
      }

      // Trigger success feedback
      const plugins = await getPlugins();
      plugins.triggerHaptic('notification', 'success');
      
      // Show credit count in notification body
      const notificationBody = creditCount > 0
        ? `You have ${creditCount} credit${creditCount !== 1 ? 's' : ''} left!`
        : 'You have successfully signed in';
      
      console.log('[AuthService] Notification details - Title: "Welcome back!", Body:', notificationBody);
      await plugins.showNotification('Welcome back!', notificationBody);
      console.log('[AuthService] Notification sent');

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Trigger error feedback
      const plugins = await getPlugins();
      plugins.triggerHaptic('notification', 'error');
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      this.currentProfile = null;

      // Trigger success feedback
      const plugins = await getPlugins();
      plugins.triggerHaptic('notification', 'success');
      await plugins.showNotification('Signed Out', 'You have been successfully signed out');

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Trigger error feedback
      const plugins = await getPlugins();
      plugins.triggerHaptic('notification', 'error');
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get the current user session
   */
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.warn('Get user error:', error);
        this.currentUser = null;
        this.currentProfile = null;
        return {
          success: false,
          error: error.message,
        };
      }

      if (!user) {
        this.currentUser = null;
        this.currentProfile = null;
        return {
          success: false,
          error: 'No authenticated user',
        };
      }

      this.currentUser = user;

      // Initialize user credits if they don't exist
      await this.initializeUserCredits();

      return {
        success: true,
        user,
        profile: user, // Use user data as profile for consistency
      };
    } catch (error) {
      console.error('Get current user error:', error);
      this.currentUser = null;
      this.currentProfile = null;
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Initialize user credits record if it doesn't exist
   */
  async initializeUserCredits(user = null) {
    const targetUser = user || this.currentUser;
    if (!targetUser) return;

    try {
      // Check if credits record exists
      const { data: existingCredits, error: checkError } = await supabase
        .from(TABLES.CREDITS)
        .select('id')
        .eq('user_id', targetUser.id)
        .single();

      // If no credits record exists, create one
      if (checkError && checkError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from(TABLES.CREDITS)
          .insert({
            user_id: targetUser.id,
            current_balance: 2, // Give new users 2 free credits
            total_purchased: 0,
            total_consumed: 0,
          });

        if (insertError) {
          console.error('Error creating credits record:', insertError);
        } else {
          console.log('Created credits record for new user');
        }
      }
    } catch (error) {
      console.error('Error initializing user credits:', error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      // Trigger success feedback
      const plugins = await getPlugins();
      plugins.triggerHaptic('notification', 'success');
      await plugins.showNotification('Email Sent', 'Check your email for password reset instructions');

      return {
        success: true,
        message: 'Password reset email sent',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      
      // Trigger error feedback
      const plugins = await getPlugins();
      plugins.triggerHaptic('notification', 'error');
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (session?.user) {
        this.currentUser = session.user;
        await this.initializeUserCredits();
      } else {
        this.currentUser = null;
        this.currentProfile = null;
      }

      callback(event, session);
    });
  }

  /**
   * Get current user (synchronous)
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Get current profile (synchronous)
   */
  getProfile() {
    return this.currentProfile;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Send magic link for passwordless authentication
   * @param {string} email - User's email address
   * @returns {Promise<{success: boolean, message?: string, error?: string}>}
   */
  async sendMagicLink(email) {
    // TODO: Add email validation before sending
    // TODO: Add loading state management
    // TODO: Enhance error handling with specific error types
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: this.getRedirectUrl('/auth/callback'),
        },
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Check your email for the magic link',
      };
    } catch (error) {
      console.error('Magic link error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign in with Google OAuth
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async signInWithGoogle() {
    // TODO: Configure Google OAuth provider in Supabase dashboard per docs/supabase-auth-configuration.md
    // TODO: Add loading state management
    // TODO: Handle OAuth redirect errors and cancellations
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: this.getRedirectUrl('/auth/callback'),
        },
      });

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign in with Apple OAuth
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async signInWithApple() {
    // TODO: Configure Apple OAuth provider in Supabase dashboard per docs/supabase-auth-configuration.md
    // TODO: Add loading state management
    // TODO: Handle OAuth redirect errors and cancellations
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: this.getRedirectUrl('/auth/callback'),
        },
      });

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error) {
      console.error('Apple OAuth error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new AuthService();
