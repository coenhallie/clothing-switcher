import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useBiometricAuth } from './useBiometricAuth'
import { usePlatform } from './usePlatform'

/**
 * Composable for handling app lifecycle events
 *
 * Session persistence is handled by Supabase's built-in mechanisms:
 *   - autoRefreshToken: true  — tokens are refreshed automatically
 *   - persistSession: true    — sessions survive app restarts via localStorage
 *
 * We intentionally do NOT log users out on app close or background.
 * Doing so destroyed ongoing API requests (Decart video generation,
 * Gemini image generation) and forced unnecessary re-authentication.
 */
export function useAppLifecycle() {
  const authStore = useAuthStore()
  const { biometricLogin, isBiometricEnabled } = useBiometricAuth()
  const { isMobile } = usePlatform()

  /**
   * Handle app startup/resume
   * Restores session from Supabase's persisted storage if available.
   * Attempts biometric login on mobile if no existing session is found.
   */
  const handleAppStartup = async () => {
    console.log('🔄 [AppLifecycle] App startup - checking authentication state...')

    // Clear any stale logout flags from the old logout-on-close mechanism
    authStore.clearLogoutFlag()

    // If user is already authenticated (session restored by Supabase), we're done
    if (authStore.isAuthenticated) {
      console.log('✅ [AppLifecycle] User already authenticated')
      return
    }

    // No existing session — try biometric auth on mobile
    if (isMobile.value && isBiometricEnabled.value) {
      console.log('📱 [AppLifecycle] Attempting biometric login on startup')

      const result = await biometricLogin()

      if (result.success) {
        console.log('✅ [AppLifecycle] Biometric login successful')
      } else {
        console.log('ℹ️ [AppLifecycle] Biometric login failed or cancelled:', result.error)
        // User will see login screen
      }
    } else {
      console.log('ℹ️ [AppLifecycle] No biometric auth available or enabled')
    }
  }

  /**
   * Cleanup event listeners (no-op now — no listeners to remove)
   */
  const cleanup = () => {
    console.log('🧹 [AppLifecycle] Lifecycle cleanup (no active listeners)')
  }

  /**
   * Initialize app lifecycle management
   */
  const initialize = async () => {
    console.log('🚀 [AppLifecycle] Initializing app lifecycle management...')
    await handleAppStartup()
    console.log('✅ [AppLifecycle] App lifecycle initialization complete')
  }

  return {
    initialize,
    cleanup,
    handleAppStartup
  }
}
