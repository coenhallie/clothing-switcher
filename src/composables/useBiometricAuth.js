import { ref, computed } from 'vue'
import { useBiometric } from './useBiometric'
import { useAuthStore } from '@/stores/authStore'
import { usePlatform } from './usePlatform'

/**
 * Composable for managing biometric authentication settings and login
 * Handles enabling/disabling biometric auth and performing biometric login
 */
export function useBiometricAuth() {
  const { quickAuth, isAuthenticating } = useBiometric()
  const authStore = useAuthStore()
  const { isMobile } = usePlatform()

  // Key for localStorage
  const BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled'
  const BIOMETRIC_USER_ID_KEY = 'biometric_user_id'

  /**
   * Check if biometric authentication is enabled for current user
   * @returns {boolean}
   */
  const isBiometricEnabled = computed(() => {
    if (!isMobile.value) return false
    
    const enabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY)
    const storedUserId = localStorage.getItem(BIOMETRIC_USER_ID_KEY)
    const currentUserId = authStore.user?.id
    
    // Biometric is enabled if:
    // 1. The flag is set to 'true'
    // 2. The stored user ID matches the current user (or no user is logged in yet)
    return enabled === 'true' && (!currentUserId || storedUserId === currentUserId)
  })

  /**
   * Check if device supports biometric authentication
   * @returns {boolean}
   */
  const isBiometricAvailable = computed(() => {
    // Only available on mobile platforms
    return isMobile.value
  })

  /**
   * Enable biometric authentication for current user
   * Should be called after successful email/password login
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const enableBiometric = async () => {
    if (!authStore.isAuthenticated) {
      return {
        success: false,
        error: 'User must be authenticated to enable biometric'
      }
    }

    if (!isMobile.value) {
      return {
        success: false,
        error: 'Biometric authentication is only available on mobile'
      }
    }

    try {
      // Test biometric authentication
      const authenticated = await quickAuth('Enable biometric login for SwitchFit Studio')
      
      if (authenticated) {
        // Store settings
        localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true')
        localStorage.setItem(BIOMETRIC_USER_ID_KEY, authStore.user.id)
        
        return { success: true }
      } else {
        return {
          success: false,
          error: 'Biometric authentication failed'
        }
      }
    } catch (error) {
      console.error('Error enabling biometric:', error)
      return {
        success: false,
        error: error.message || 'Failed to enable biometric authentication'
      }
    }
  }

  /**
   * Disable biometric authentication
   */
  const disableBiometric = () => {
    localStorage.removeItem(BIOMETRIC_ENABLED_KEY)
    localStorage.removeItem(BIOMETRIC_USER_ID_KEY)
  }

  /**
   * Perform biometric login
   * Uses biometric auth to unlock existing Supabase session
   * Compatible with logout-on-close: clears logout flag on success
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const biometricLogin = async () => {
    if (!isBiometricEnabled.value) {
      return {
        success: false,
        error: 'Biometric authentication is not enabled'
      }
    }

    try {
      // Authenticate with biometric
      const authenticated = await quickAuth('Sign in to SwitchFit Studio')
      
      if (!authenticated) {
        return {
          success: false,
          error: 'Biometric authentication failed'
        }
      }

      // Try to restore session from Supabase (it stores session in localStorage)
      const result = await authStore.loadCurrentUser()
      
      if (result.success) {
        // Clear logout flag on successful biometric login
        authStore.clearLogoutFlag()
        console.log('✅ [BiometricAuth] Biometric login successful - logout flag cleared')
        return { success: true }
      } else {
        // If session expired or invalid, disable biometric and require re-login
        disableBiometric()
        console.warn('⚠️ [BiometricAuth] Session expired - biometric disabled')
        return {
          success: false,
          error: 'Session expired. Please sign in with email and password.'
        }
      }
    } catch (error) {
      console.error('❌ [BiometricAuth] Biometric login error:', error)
      return {
        success: false,
        error: error.message || 'Biometric login failed'
      }
    }
  }

  /**
   * Check if biometric should be offered after login
   * @returns {boolean}
   */
  const shouldOfferBiometric = computed(() => {
    return isMobile.value && 
           authStore.isAuthenticated && 
           !isBiometricEnabled.value
  })

  return {
    // State
    isBiometricEnabled,
    isBiometricAvailable,
    isAuthenticating,
    shouldOfferBiometric,

    // Actions
    enableBiometric,
    disableBiometric,
    biometricLogin
  }
}