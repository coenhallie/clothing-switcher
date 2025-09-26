import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '../services/authService.js';
import { supabase } from '../services/supabaseClient.js';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const profile = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const userEmail = computed(() => user.value?.email || '');
  const userName = computed(() => profile.value?.full_name || userEmail.value);
  const userCredits = computed(() => profile.value?.credits || 0);

  // Actions
  const setLoading = (loading) => {
    isLoading.value = loading;
  };

  const setError = (errorMessage) => {
    error.value = errorMessage;
  };

  const clearError = () => {
    error.value = null;
  };

  const setUser = (userData) => {
    user.value = userData;
  };

  const setProfile = (profileData) => {
    profile.value = profileData;
  };

  const signUp = async (email, password, fullName = '') => {
    setLoading(true);
    clearError();

    try {
      const result = await authService.signUp(email, password, fullName);

      if (result.success) {
        return {
          success: true,
          message: result.message,
        };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Sign up failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    console.log('🏪 [AuthStore] signIn called with email:', email);
    console.log('🏪 [AuthStore] Current auth state before sign in:', {
      hasUser: !!user.value,
      hasProfile: !!profile.value,
      isLoading: isLoading.value,
      hasError: !!error.value,
    });

    // Check if we have a valid existing session first
    const validSession = await validateExistingSession();
    if (validSession) {
      console.log('🏪 [AuthStore] Valid session found, using existing session');
      return {
        success: true,
        user: validSession.user,
        profile: profile.value,
      };
    }

    setLoading(true);
    clearError();

    try {
      console.log('🏪 [AuthStore] Calling authService.signIn...');
      const result = await authService.signIn(email, password);

      console.log('🏪 [AuthStore] AuthService signIn result:', {
        success: result.success,
        hasUser: !!result.user,
        hasProfile: !!result.profile,
        error: result.error,
        userEmail: result.user?.email,
        profileCredits: result.profile?.credits,
      });

      if (result.success) {
        console.log('🏪 [AuthStore] Setting user and profile in store');
        setUser(result.user);
        setProfile(result.profile);

        console.log('🏪 [AuthStore] Auth state after successful sign in:', {
          hasUser: !!user.value,
          hasProfile: !!profile.value,
          userEmail: user.value?.email,
          profileCredits: profile.value?.credits,
        });

        return {
          success: true,
          user: result.user,
          profile: result.profile,
        };
      } else {
        console.log(
          '🏪 [AuthStore] Sign in failed, setting error:',
          result.error
        );

        // If sign in fails due to session issues, try cleanup and retry once
        if (
          result.error &&
          (result.error.includes('session') ||
            result.error.includes('token') ||
            result.error.includes('expired') ||
            result.error.includes('Invalid') ||
            result.error.includes('timeout'))
        ) {
          console.warn(
            '🏪 [AuthStore] Sign in failed due to session issue, performing cleanup...'
          );
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);

          // Retry sign in once after cleanup
          console.log('🏪 [AuthStore] Retrying sign in after cleanup...');
          const retryResult = await authService.signIn(email, password);

          if (retryResult.success) {
            console.log(
              '🏪 [AuthStore] Retry successful, setting user and profile'
            );
            setUser(retryResult.user);
            setProfile(retryResult.user);
            return {
              success: true,
              user: retryResult.user,
              profile: retryResult.user,
            };
          } else {
            console.log('🏪 [AuthStore] Retry also failed:', retryResult.error);
            setError(retryResult.error);
            return {
              success: false,
              error: retryResult.error,
            };
          }
        }

        setError(result.error);
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Sign in failed';
      console.error('🏪 [AuthStore] Sign in exception:', err);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      console.log('🏪 [AuthStore] Setting loading to false');
      setLoading(false);
    }
  };

  const signOut = async () => {
    clearError();

    try {
      const result = await authService.signOut();

      if (result.success) {
        setUser(null);
        setProfile(null);
        return { success: true };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Sign out failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const loadCurrentUser = async () => {
    console.log('🔍 [AuthStore] loadCurrentUser called');
    console.log('🔍 [AuthStore] Current state before loading:', {
      hasUser: !!user.value,
      hasProfile: !!profile.value,
      hasError: !!error.value,
    });

    // Check localStorage state before loading
    const supabaseKeys = Object.keys(localStorage).filter(
      (key) => key.includes('supabase') || key.startsWith('sb-')
    );
    console.log(
      '🔍 [AuthStore] Supabase localStorage keys before load:',
      supabaseKeys
    );

    clearError();

    try {
      // First check if there's a valid session in Supabase
      console.log('🔍 [AuthStore] Checking for existing Supabase session...');
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn('🔍 [AuthStore] Session check error:', sessionError);
      }

      if (session && session.user) {
        console.log('🔍 [AuthStore] Found valid session in Supabase:', {
          userEmail: session.user.email,
          expiresAt: new Date(session.expires_at * 1000).toISOString(),
        });

        // Set user data from session
        setUser(session.user);
        setProfile(session.user);

        // Initialize user credits
        try {
          await authService.initializeUserCredits(session.user);
        } catch (creditsError) {
          console.warn(
            '🔍 [AuthStore] Failed to initialize credits:',
            creditsError
          );
        }

        console.log('🔍 [AuthStore] State after session restore:', {
          hasUser: !!user.value,
          hasProfile: !!profile.value,
          userEmail: user.value?.email,
          isAuthenticated: isAuthenticated.value,
        });

        return {
          success: true,
          user: session.user,
          profile: session.user,
        };
      }

      // If no session found, try the auth service method
      console.log(
        '🔍 [AuthStore] No session found, calling authService.getCurrentUser...'
      );
      const result = await authService.getCurrentUser();

      console.log('🔍 [AuthStore] AuthService getCurrentUser result:', {
        success: result.success,
        hasUser: !!result.user,
        hasProfile: !!result.profile,
        error: result.error,
        userEmail: result.user?.email,
      });

      if (result.success) {
        console.log(
          '🔍 [AuthStore] Setting user and profile from getCurrentUser'
        );
        setUser(result.user);
        setProfile(result.profile || result.user);

        console.log('🔍 [AuthStore] State after successful load:', {
          hasUser: !!user.value,
          hasProfile: !!profile.value,
          userEmail: user.value?.email,
          isAuthenticated: isAuthenticated.value,
        });

        return {
          success: true,
          user: result.user,
          profile: result.profile || result.user,
        };
      } else {
        console.log(
          '🔍 [AuthStore] getCurrentUser failed, clearing user state'
        );
        // Clear user state if session is invalid
        setUser(null);
        setProfile(null);

        // Don't set error for missing sessions - that's normal
        if (result.error !== 'No authenticated user') {
          console.warn('🔍 [AuthStore] Session loading failed:', result.error);
          // Only set error for unexpected failures
          if (
            !result.error.includes('expired') &&
            !result.error.includes('Invalid') &&
            !result.error.includes('JWT')
          ) {
            setError(result.error);
          }
        }
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load user';
      console.error('🔍 [AuthStore] Load current user error:', err);

      // Clear user state on error
      setUser(null);
      setProfile(null);

      // Only set error for unexpected failures
      if (!errorMessage.includes('No authenticated user')) {
        setError(errorMessage);
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const updateProfile = async (updates) => {
    setLoading(true);
    clearError();

    try {
      // Update user metadata in Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        setProfile(data.user);
        return {
          success: true,
          profile: data.user,
        };
      } else {
        throw new Error('Failed to update user');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    clearError();

    try {
      const result = await authService.resetPassword(email);

      if (result.success) {
        return {
          success: true,
          message: result.message,
        };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Password reset failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword) => {
    setLoading(true);
    clearError();

    try {
      const result = await authService.updatePassword(newPassword);

      if (result.success) {
        return {
          success: true,
          message: result.message,
        };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Password update failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      // Since we're using Supabase Auth, we don't need a separate profile loading
      // The user data comes from Supabase Auth directly
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        return null;
      }

      setUser(user);
      return user;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      return null;
    }
  };

  // Initialize auth state listener
  const initializeAuth = () => {
    return authService.onAuthStateChange(async (event, session) => {
      console.log(
        '🔄 [AuthStore] Auth state change:',
        event,
        session ? 'session exists' : 'no session'
      );

      if (event === 'SIGNED_IN') {
        console.log(
          '🔄 [AuthStore] Processing SIGNED_IN - updating store state'
        );
        setUser(session?.user || null);
        setProfile(session?.user || null);
        clearError(); // Clear any previous errors on successful sign in
        console.log('🔄 [AuthStore] Store state updated:', {
          hasUser: !!session?.user,
          hasProfile: !!session?.user,
          userEmail: session?.user?.email,
          isAuthenticated: isAuthenticated.value,
        });

        // Load credits when user signs in
        if (session?.user) {
          console.log('💰 [AuthStore] Loading credits for signed in user...');
          try {
            // Import creditStore dynamically to avoid circular dependency
            const { useCreditStore } = await import('./creditStore.js');
            const creditStore = useCreditStore();
            await creditStore.loadCredits();
            creditStore.initializeSubscriptions();
            console.log('💰 [AuthStore] Credits loaded successfully');
          } catch (error) {
            console.error('💰 [AuthStore] Failed to load credits:', error);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log(
          '🔄 [AuthStore] Processing SIGNED_OUT - clearing store state'
        );
        setUser(null);
        setProfile(null);
        clearError(); // Clear errors on sign out

        // Reset credits when user signs out
        try {
          const { useCreditStore } = await import('./creditStore.js');
          const creditStore = useCreditStore();
          creditStore.reset();
          console.log('💰 [AuthStore] Credits reset on sign out');
        } catch (error) {
          console.error('💰 [AuthStore] Failed to reset credits:', error);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log(
          '🔄 [AuthStore] Processing TOKEN_REFRESHED - updating user'
        );
        // Update user data on token refresh
        setUser(session?.user || null);
        setProfile(session?.user || null);
        console.log('Token refreshed successfully');
      }
    });
  };

  // Clear corrupted session data (utility function for troubleshooting)
  const clearCorruptedSession = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      return { success: true };
    } catch (error) {
      console.error('Failed to clear session:', error);
      return { success: false, error: error.message };
    }
  };

  // Validate existing session before attempting new login
  const validateExistingSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && session.expires_at > Date.now() / 1000) {
        console.log('🏪 [AuthStore] Valid existing session found');
        setUser(session.user);
        setProfile(session.user);
        return session;
      }
      return null;
    } catch (error) {
      console.warn('🏪 [AuthStore] Session validation failed:', error);
      return null;
    }
  };

  // Manual clear all auth data (for troubleshooting login issues)
  const clearAllAuthData = async () => {
    try {
      console.log('Clearing all authentication data...');

      // Clear Supabase session
      await supabase.auth.signOut();

      // Clear all local storage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Clear session storage as well
      sessionStorage.clear();

      // Reset store state
      setUser(null);
      setProfile(null);
      setError(null);
      setLoading(false);

      console.log('All authentication data cleared successfully');
      return { success: true, message: 'All authentication data cleared' };
    } catch (error) {
      console.error('Failed to clear all auth data:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    // State
    user,
    profile,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userEmail,
    userName,
    userCredits,

    // Actions
    setLoading,
    setError,
    clearError,
    setUser,
    setProfile,
    signUp,
    signIn,
    signOut,
    loadCurrentUser,
    updateProfile,
    resetPassword,
    updatePassword,
    refreshProfile,
    initializeAuth,
    clearCorruptedSession,
    clearAllAuthData,
    validateExistingSession,
  };
});
