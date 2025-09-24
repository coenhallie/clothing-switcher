import { supabase, TABLES, isSupabaseConfigured } from './supabaseClient.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.currentProfile = null;
  }

  /**
   * Sign up a new user
   */
  async signUp(email, password, username = '', fullName = '') {
    try {
      // First create the auth user
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

      // If user is created and confirmed, create user record
      if (data.user && data.user.email_confirmed_at) {
        await this.createUserRecord(data.user, username);
      }

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
   * Sign in an existing user
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      this.currentUser = data.user;
      await this.loadProfile();

      return {
        success: true,
        user: data.user,
        profile: this.currentProfile,
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

      // If there's an error but it's just "no session", that's normal
      if (error && error.message !== 'Auth session missing!') {
        throw error;
      }

      this.currentUser = user;
      if (user) {
        await this.loadProfile();
      }

      return {
        success: true,
        user,
        profile: this.currentProfile,
      };
    } catch (error) {
      // Only log actual errors, not missing sessions
      if (error.message !== 'Auth session missing!') {
        console.error('Get current user error:', error);
      }
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Load user profile from database
   */
  async loadProfile() {
    if (!this.currentUser) return null;

    try {
      // Get user record from users table
      const { data: userData, error: userError } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', this.currentUser.id)
        .single();

      if (userError) {
        // If user doesn't exist in our users table, create it
        if (userError.code === 'PGRST116') {
          return await this.createUserRecord(this.currentUser);
        }
        throw userError;
      }

      // Get credit information
      const { data: creditData, error: creditError } = await supabase
        .from(TABLES.CREDITS)
        .select('*')
        .eq('user_id', this.currentUser.id)
        .single();

      // Combine user and credit data
      this.currentProfile = {
        ...userData,
        credits: creditData?.current_balance || 0,
        total_purchased: creditData?.total_purchased || 0,
        total_consumed: creditData?.total_consumed || 0,
      };

      return this.currentProfile;
    } catch (error) {
      console.error('Load profile error:', error);
      return null;
    }
  }

  /**
   * Create a new user record in our users table
   */
  async createUserRecord(authUser, username = '') {
    if (!authUser) return null;

    try {
      const userData = {
        id: authUser.id,
        email: authUser.email,
        username:
          username ||
          authUser.user_metadata?.username ||
          authUser.email.split('@')[0],
        password_hash: 'managed_by_supabase_auth', // We don't store the actual hash
        email_verified: !!authUser.email_confirmed_at,
      };

      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert(userData)
        .select()
        .single();

      if (error) throw error;

      // The trigger should automatically create the credit record
      // Let's wait a moment and then load the profile
      setTimeout(() => this.loadProfile(), 1000);

      return data;
    } catch (error) {
      console.error('Create user record error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      // Only update fields that exist in the users table
      const userUpdates = {};
      if (updates.username) userUpdates.username = updates.username;
      if (updates.email) userUpdates.email = updates.email;

      if (Object.keys(userUpdates).length > 0) {
        const { data, error } = await supabase
          .from(TABLES.USERS)
          .update(userUpdates)
          .eq('id', this.currentUser.id)
          .select()
          .single();

        if (error) throw error;

        // Reload profile to get updated data
        await this.loadProfile();
      }

      return {
        success: true,
        profile: this.currentProfile,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

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
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        this.currentUser = session?.user || null;
        if (this.currentUser) {
          await this.loadProfile();
        }
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.currentProfile = null;
      }

      callback(event, session, this.currentProfile);
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Get current user profile
   */
  getProfile() {
    return this.currentProfile;
  }

  /**
   * Get current user
   */
  getUser() {
    return this.currentUser;
  }
}

export default new AuthService();
