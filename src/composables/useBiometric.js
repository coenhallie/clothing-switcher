import { ref } from 'vue'
import { authenticate } from '@tauri-apps/plugin-biometric'

/**
 * Composable for biometric authentication (fingerprint/face ID)
 * Works on mobile devices (iOS and Android)
 */
export function useBiometric() {
  const isAuthenticating = ref(false)
  const lastError = ref(null)

  /**
   * Authenticate user with biometrics
   * @param {string} reason - Reason message shown to user
   * @param {Object} options - Optional authentication options
   * @returns {Promise<boolean>} - True if authenticated, false otherwise
   */
  const authenticateUser = async (reason = 'Please authenticate to continue', options = {}) => {
    isAuthenticating.value = true
    lastError.value = null

    try {
      // Call authenticate with just the reason string as per Tauri docs
      const result = await authenticate(reason)

      isAuthenticating.value = false
      return result
    } catch (error) {
      console.error('Biometric authentication failed:', error)
      lastError.value = error
      isAuthenticating.value = false
      return false
    }
  }

  /**
   * Quick authentication for secure features
   * @param {string} reason - Custom reason message
   * @returns {Promise<boolean>}
   */
  const quickAuth = async (reason = 'Verify your identity') => {
    return authenticateUser(reason)
  }

  /**
   * Authenticate for sensitive operations (payment, data access, etc.)
   * @param {string} action - Action description
   * @returns {Promise<boolean>}
   */
  const authenticateForAction = async (action) => {
    return authenticateUser(`Authenticate to ${action}`, {
      allowDeviceCredential: true
    })
  }

  return {
    isAuthenticating,
    lastError,
    authenticateUser,
    quickAuth,
    authenticateForAction
  }
}