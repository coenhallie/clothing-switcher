import { supabase, TABLES, isSupabaseConfigured } from './supabaseClient.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.currentProfile = null;
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

      return {
        success: true,
        user: data.user,
        message: 'Please check your email to confirm your account',
      };
    } catch (error) {
      console.error('Sign up error:', error);
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

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error('Sign in error:', error);
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

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
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

      return {
        success: true,
        message: 'Password reset email sent',
      };
    } catch (error) {
      console.error('Reset password error:', error);
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
}

export default new AuthService();
