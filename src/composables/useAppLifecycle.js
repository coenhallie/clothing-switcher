import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useBiometricAuth } from './useBiometricAuth'
import { usePlatform } from './usePlatform'

/**
 * Composable for handling app lifecycle events
 * Manages logout on app close and auto-login on app startup
 */
export function useAppLifecycle() {
  const authStore = useAuthStore()
  const { biometricLogin, isBiometricEnabled } = useBiometricAuth()
  const { isMobile } = usePlatform()

  let unlistenAppClose = null
  let unlistenAppHide = null
  let unlistenWindowClose = null

  /**
   * Handle app being closed or backgrounded
   * Logs out the user to ensure security
   */
  const handleAppClose = async () => {
    console.log('🚪 [AppLifecycle] App closing - initiating logout...')
    
    if (authStore.isAuthenticated) {
      await authStore.logoutOnClose()
      console.log('✅ [AppLifecycle] User logged out on app close')
    } else {
      console.log('ℹ️ [AppLifecycle] No authenticated user to logout')
    }
  }

  /**
   * Handle app startup/resume
   * Checks if logout occurred and requires re-authentication
   * Attempts biometric login if enabled and user is not already authenticated
   */
  const handleAppStartup = async () => {
    console.log('🔄 [AppLifecycle] App startup - checking authentication state...')
    
    // Check if logout flag is set (app was closed with user logged in)
    if (authStore.shouldRequireAuth()) {
      console.log('🔒 [AppLifecycle] Logout flag detected - authentication required')
      
      // If user is somehow authenticated, clear it (shouldn't happen but be safe)
      if (authStore.isAuthenticated) {
        console.warn('⚠️ [AppLifecycle] User authenticated despite logout flag - clearing...')
        await authStore.logoutOnClose()
      }
      
      // Try biometric authentication if enabled on mobile
      if (isMobile.value && isBiometricEnabled.value) {
        console.log('📱 [AppLifecycle] Attempting biometric re-authentication...')
        
        const result = await biometricLogin()
        
        if (result.success) {
          console.log('✅ [AppLifecycle] Biometric re-authentication successful')
          authStore.clearLogoutFlag()
        } else {
          console.log('❌ [AppLifecycle] Biometric re-authentication failed:', result.error)
          // User will need to login with email/password
        }
      } else {
        console.log('ℹ️ [AppLifecycle] No biometric auth available - user must login manually')
      }
      
      return
    }
    
    // No logout flag, proceed with normal startup
    console.log('ℹ️ [AppLifecycle] No logout flag - normal startup')
    
    // If user is already authenticated (existing session), we're done
    if (authStore.isAuthenticated) {
      console.log('✅ [AppLifecycle] User already authenticated')
      authStore.clearLogoutFlag() // Clear any stale flags
      return
    }

    // No existing session, check for biometric auth
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
      // User will see login screen
    }
  }

  /**
   * Setup lifecycle event listeners
   */
  const setupListeners = async () => {
    // Only setup Tauri-specific listeners if running in Tauri
    if (!window.__TAURI__) {
      console.log('🌐 [AppLifecycle] Not running in Tauri, skipping lifecycle listeners')
      
      // For web, use beforeunload as a best-effort logout trigger
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', (event) => {
          if (authStore.isAuthenticated) {
            console.log('🌐 [AppLifecycle] Web beforeunload - marking logout required')
            // Mark for logout on next load (synchronous)
            try {
              localStorage.setItem('logout_on_close_flag', 'true')
              localStorage.setItem('last_logout_timestamp', Date.now().toString())
            } catch (error) {
              console.error('❌ [AppLifecycle] Failed to set logout flag:', error)
            }
          }
        })
      }
      
      return
    }

    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      const { listen } = await import('@tauri-apps/api/event')
      
      console.log('🎧 [AppLifecycle] Setting up Tauri event listeners...')
      
      // Listen for custom app-closing event from Rust backend
      unlistenAppClose = await listen('app-closing', async () => {
        console.log('🎧 [AppLifecycle] Received app-closing event from backend')
        await handleAppClose()
      })
      
      // Listen for app hide/background events (mobile)
      if (isMobile.value) {
        unlistenAppHide = await listen('tauri://blur', async () => {
          console.log('📱 [AppLifecycle] App backgrounded (mobile)')
          await handleAppClose()
        })
        
        console.log('📱 [AppLifecycle] Mobile blur listener registered')
      }

      // Additional fallback: Listen for window close events
      const currentWindow = getCurrentWindow()
      unlistenWindowClose = await currentWindow.listen('tauri://close-requested', async () => {
        console.log('🎧 [AppLifecycle] Window close requested (fallback)')
        await handleAppClose()
      })

      console.log('✅ [AppLifecycle] All lifecycle listeners setup complete')
    } catch (error) {
      console.error('❌ [AppLifecycle] Error setting up lifecycle listeners:', error)
    }
  }

  /**
   * Cleanup event listeners
   */
  const cleanup = () => {
    if (unlistenAppClose) {
      unlistenAppClose()
      unlistenAppClose = null
    }
    if (unlistenAppHide) {
      unlistenAppHide()
      unlistenAppHide = null
    }
    if (unlistenWindowClose) {
      unlistenWindowClose()
      unlistenWindowClose = null
    }
    console.log('🧹 [AppLifecycle] Lifecycle listeners cleaned up')
  }

  /**
   * Initialize app lifecycle management
   */
  const initialize = async () => {
    console.log('🚀 [AppLifecycle] Initializing app lifecycle management...')
    await setupListeners()
    await handleAppStartup()
    console.log('✅ [AppLifecycle] App lifecycle initialization complete')
  }

  return {
    initialize,
    cleanup,
    handleAppClose,
    handleAppStartup
  }
}