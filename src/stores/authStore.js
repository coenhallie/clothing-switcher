import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '../services/authService.js';
import { supabase } from '../services/supabaseClient.js';
import router from '../router/index.js';
import { detectPlatformSync } from '../utils/platformDetection.js';
import { STORAGE_KEYS } from '../constants/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('AuthStore');

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const profile = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const sessionRestorationComplete = ref(false);

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
    logger.debug('signIn called with email:', email);
    logger.debug('Current auth state before sign in:', {
      hasUser: !!user.value,
      hasProfile: !!profile.value,
      isLoading: isLoading.value,
      hasError: !!error.value,
    });

    // Check if we have a valid existing session first
    const validSession = await validateExistingSession();
    if (validSession) {
      logger.debug('Valid session found, using existing session');
      return {
        success: true,
        user: validSession.user,
        profile: profile.value,
      };
    }

    setLoading(true);
    clearError();

    try {
      logger.debug('Calling authService.signIn...');
      const result = await authService.signIn(email, password);

      logger.debug('AuthService signIn result:', {
        success: result.success,
        hasUser: !!result.user,
        hasProfile: !!result.profile,
        error: result.error,
        userEmail: result.user?.email,
        profileCredits: result.profile?.credits,
      });

      if (result.success) {
        logger.debug('Setting user and profile in store');
        setUser(result.user);
        setProfile(result.profile);
        
        // Clear logout flag on successful authentication
        clearLogoutFlag();
        logger.debug('Logout flag cleared on successful sign in');

        logger.debug('Auth state after successful sign in:', {
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
        logger.warn('Sign in failed, setting error:', result.error);

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
          logger.debug('Retrying sign in after cleanup...');
          const retryResult = await authService.signIn(email, password);

          if (retryResult.success) {
            logger.debug('Retry successful, setting user and profile');
            setUser(retryResult.user);
            setProfile(retryResult.profile || retryResult.user);
            
            // Clear logout flag on successful retry
            clearLogoutFlag();
            logger.debug('Logout flag cleared on retry success');
            
            return {
              success: true,
              user: retryResult.user,
              profile: retryResult.profile || retryResult.user,
            };
          } else {
            logger.warn('Retry also failed:', retryResult.error);
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
      logger.error('Sign in exception:', err);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      logger.debug('Setting loading to false');
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

  /**
   * Ensures session restoration is complete before routing
   * Returns a promise that resolves when loadCurrentUser() completes
   * Used by routing guards to prevent race conditions
   */
  const ensureSessionRestored = async () => {
    if (sessionRestorationComplete.value) {
      return { success: true, user: user.value, profile: profile.value };
    }
    
    const result = await loadCurrentUser();
    sessionRestorationComplete.value = true;
    return result;
  };

  const loadCurrentUser = async () => {
    logger.debug('loadCurrentUser called');
    logger.debug('Current state before loading:', {
      hasUser: !!user.value,
      hasProfile: !!profile.value,
      hasError: !!error.value,
    });

    // Check localStorage state before loading
    const supabaseKeys = Object.keys(localStorage).filter(
      (key) => key.includes('supabase') || key.startsWith('sb-')
    );
    logger.debug('Supabase localStorage keys before load:', supabaseKeys);

    clearError();

    try {
      // First check if there's a valid session in Supabase
      logger.debug('Checking for existing Supabase session...');
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        logger.warn('Session check error:', sessionError);
      }

      if (session && session.user) {
        logger.debug('Found valid session in Supabase:', {
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
          logger.warn('Failed to initialize credits:', creditsError);
        }

        logger.debug('State after session restore:', {
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
      logger.debug('No session found, calling authService.getCurrentUser...');
      const result = await authService.getCurrentUser();

      logger.debug('AuthService getCurrentUser result:', {
        success: result.success,
        hasUser: !!result.user,
        hasProfile: !!result.profile,
        error: result.error,
        userEmail: result.user?.email,
      });

      if (result.success) {
        logger.debug('Setting user and profile from getCurrentUser');
        setUser(result.user);
        setProfile(result.profile || result.user);

        logger.debug('State after successful load:', {
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
        logger.debug('getCurrentUser failed, clearing user state');
        // Clear user state if session is invalid
        setUser(null);
        setProfile(null);

        // Don't set error for missing sessions - that's normal
        if (result.error !== 'No authenticated user' && result.error !== 'Auth session missing!') {
          // Expected missing session errors should be debug level
          if (result.error.includes('Auth session missing')) {
            logger.debug('Session loading failed:', result.error);
          } else {
            logger.warn('Session loading failed:', result.error);
          }
          // Only set error for unexpected failures
          if (
            !result.error.includes('expired') &&
            !result.error.includes('Invalid') &&
            !result.error.includes('JWT') &&
            !result.error.includes('Auth session missing')
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
      logger.error('Load current user error:', err);

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
      logger.error('Failed to refresh profile:', err);
      return null;
    }
  };

  // Initialize auth state listener
  const initializeAuth = () => {
    return authService.onAuthStateChange(async (event, session) => {
      logger.debug('Auth state change:', event, session ? 'session exists' : 'no session');

      if (event === 'SIGNED_IN') {
        logger.debug('Processing SIGNED_IN - updating store state');
        setUser(session?.user || null);
        setProfile(session?.user || null);
        clearError(); // Clear any previous errors on successful sign in
        logger.debug('Store state updated:', {
          hasUser: !!session?.user,
          hasProfile: !!session?.user,
          userEmail: session?.user?.email,
          isAuthenticated: isAuthenticated.value,
        });

        // Load credits when user signs in
        if (session?.user) {
          logger.debug('Loading credits for signed in user...');
          try {
            // Import creditStore dynamically to avoid circular dependency
            const { useCreditStore } = await import('./creditStore.js');
            const creditStore = useCreditStore();
            await creditStore.loadCredits();
            creditStore.initializeSubscriptions();
            logger.debug('Credits loaded successfully');
          } catch (error) {
            logger.error('Failed to load credits:', error);
          }
        }

        // Platform-aware navigation after sign in
        const { isMobile } = detectPlatformSync();
        
        if (isMobile) {
          // Mobile: always redirect to query param or home after sign in
          const redirectPath = router.currentRoute.value.query.redirect || '/';
          logger.debug('Mobile sign in - redirecting to:', redirectPath);
          router.push(redirectPath);
        } else {
          // Desktop: check sessionStorage for post-auth redirect
          const postAuthRedirect = sessionStorage.getItem(STORAGE_KEYS.AUTH_REDIRECT);
          if (postAuthRedirect) {
            logger.debug('Desktop sign in - redirecting to:', postAuthRedirect);
            sessionStorage.removeItem(STORAGE_KEYS.AUTH_REDIRECT);
            router.push(postAuthRedirect);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        logger.debug('Processing SIGNED_OUT - clearing store state');
        setUser(null);
        setProfile(null);
        clearError(); // Clear errors on sign out

        // Reset credits when user signs out
        try {
          const { useCreditStore } = await import('./creditStore.js');
          const creditStore = useCreditStore();
          creditStore.reset();
          logger.debug('Credits reset on sign out');
        } catch (error) {
          logger.error('Failed to reset credits:', error);
        }

        // Platform-aware navigation after sign out
        const { isMobile } = detectPlatformSync();
        
        const targetPath = isMobile ? '/auth' : '/';
        logger.debug('Sign out - redirecting to:', targetPath);
        router.push(targetPath);
      } else if (event === 'TOKEN_REFRESHED') {
        logger.debug('Processing TOKEN_REFRESHED - updating user');
        // Update user data on token refresh
        setUser(session?.user || null);
        setProfile(session?.user || null);
        logger.debug('Token refreshed successfully');
        
        // TODO: Implement enhanced token refresh handling per docs/supabase-auth-configuration.md
        // - Add retry logic for failed token refreshes
        // - Implement cross-device session sync notifications
        // - Add session revocation detection and cleanup
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
      logger.error('Failed to clear session:', error);
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
        logger.debug('Valid existing session found');
        setUser(session.user);
        setProfile(session.user);
        return session;
      }
      return null;
    } catch (error) {
      logger.warn('Session validation failed:', error);
      return null;
    }
  };

  /**
   * Comprehensive logout that clears all authentication cache and session data
   * Used for logout-on-close functionality
   */
  const clearAllAuthData = async () => {
    try {
      logger.info('Clearing all authentication data...');

      // 1. Sign out from Supabase to invalidate session on server
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        logger.warn('Supabase signOut error (continuing cleanup):', error);
      }

      // 2. Clear all localStorage items (including Supabase session tokens)
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          logger.warn(`Failed to remove localStorage key ${key}:`, error);
        }
      });

      // 3. Clear sessionStorage completely
      try {
        sessionStorage.clear();
      } catch (error) {
        logger.warn('Failed to clear sessionStorage:', error);
      }

      // 4. Clear any cookies (if browser allows)
      if (document.cookie) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      }

      // 5. Reset store state
      setUser(null);
      setProfile(null);
      setError(null);
      setLoading(false);
      sessionRestorationComplete.value = false;

      // 6. Mark that logout occurred (for startup check)
      try {
        localStorage.setItem(STORAGE_KEYS.LOGOUT_FLAG, 'true');
        localStorage.setItem(STORAGE_KEYS.LOGOUT_TIMESTAMP, Date.now().toString());
      } catch (error) {
        logger.warn('Failed to set logout flag:', error);
      }

      logger.info('All authentication data cleared successfully');
      return { success: true, message: 'All authentication data cleared' };
    } catch (error) {
      logger.error('Failed to clear all auth data:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Clear the logout flag after successful authentication
   */
  const clearLogoutFlag = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOGOUT_FLAG);
      localStorage.removeItem(STORAGE_KEYS.LOGOUT_TIMESTAMP);
    } catch (error) {
      logger.warn('Failed to clear logout flag:', error);
    }
  };

  return {
    // State
    user,
    profile,
    isLoading,
    error,
    sessionRestorationComplete,

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
    ensureSessionRestored,
    updateProfile,
    resetPassword,
    updatePassword,
    refreshProfile,
    initializeAuth,
    clearCorruptedSession,
    clearAllAuthData,
    validateExistingSession,
    clearLogoutFlag,
  };
});
