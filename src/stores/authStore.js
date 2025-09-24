import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '../services/authService.js';

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
    setLoading(true);
    clearError();

    try {
      const result = await authService.signIn(email, password);

      if (result.success) {
        setUser(result.user);
        setProfile(result.profile);
        return {
          success: true,
          user: result.user,
          profile: result.profile,
        };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Sign in failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    setLoading(true);
    clearError();

    try {
      const result = await authService.getCurrentUser();

      if (result.success) {
        setUser(result.user);
        setProfile(result.profile);
        return {
          success: true,
          user: result.user,
          profile: result.profile,
        };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load user';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    setLoading(true);
    clearError();

    try {
      const result = await authService.updateProfile(updates);

      if (result.success) {
        setProfile(result.profile);
        return {
          success: true,
          profile: result.profile,
        };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error,
        };
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
      const profileData = await authService.loadProfile();
      if (profileData) {
        setProfile(profileData);
      }
      return profileData;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      return null;
    }
  };

  // Initialize auth state listener
  const initializeAuth = () => {
    return authService.onAuthStateChange((event, session, profile) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
        setProfile(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });
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
  };
});
