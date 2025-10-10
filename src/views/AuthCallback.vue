<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
    <div class="w-full max-w-md text-center space-y-6">
      <!-- Logo -->
      <img
        :src="currentLogo"
        class="h-8 mx-auto mb-8"
        alt="SwitchFit"
      />

      <!-- Loading State -->
      <div v-if="isProcessing" class="space-y-4">
        <div class="flex justify-center">
          <svg 
            class="w-16 h-16 animate-spin text-[var(--color-brand-500)]"
            viewBox="0 0 24 24"
          >
            <circle 
              class="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              stroke-width="4" 
              fill="none"
            />
            <path 
              class="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <h2 class="
          text-xl sm:text-2xl
          font-bold
          font-[family-name:var(--font-display)]
          text-[var(--color-card-foreground)]
        ">
          Completing sign in...
        </h2>
        <p class="
          text-sm
          text-[var(--color-muted-foreground)]
        ">
          Please wait while we verify your authentication
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="space-y-6">
        <div class="
          flex items-center justify-center
          w-16 h-16
          mx-auto
          rounded-full
          bg-[var(--color-destructive-500)]/16
        ">
          <svg class="w-8 h-8 text-[var(--color-destructive-500)]" fill="none" viewBox="0 0 24 24">
            <path 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            />
          </svg>
        </div>
        
        <div class="space-y-2">
          <h2 class="
            text-xl sm:text-2xl
            font-bold
            font-[family-name:var(--font-display)]
            text-[var(--color-card-foreground)]
          ">
            Authentication Failed
          </h2>
          <p class="
            text-sm
            text-[var(--color-muted-foreground)]
          ">
            {{ error }}
          </p>
        </div>

        <button
          @click="handleRetry"
          class="mobile-cta-primary"
        >
          Try Again
        </button>
      </div>

      <!-- Success State (brief display before redirect) -->
      <div v-else-if="isSuccess" class="space-y-4">
        <div class="
          flex items-center justify-center
          w-16 h-16
          mx-auto
          rounded-full
          bg-green-500/16
        ">
          <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24">
            <path 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            />
          </svg>
        </div>
        
        <h2 class="
          text-xl sm:text-2xl
          font-bold
          font-[family-name:var(--font-display)]
          text-[var(--color-card-foreground)]
        ">
          Sign in successful!
        </h2>
        <p class="
          text-sm
          text-[var(--color-muted-foreground)]
        ">
          Redirecting you now...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/services/supabaseClient'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/composables/useTheme'
import logoBlack from '@/assets/images/logo-switchfit-black.png'
import logoWhite from '@/assets/images/logo-switchfit-white.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isDark } = useTheme()

const isProcessing = ref(true)
const isSuccess = ref(false)
const error = ref(null)

/**
 * Computed property to select the appropriate logo based on current theme
 */
const currentLogo = computed(() => isDark.value ? logoWhite : logoBlack)

/**
 * Processes the OAuth or magic link callback
 * Extracts tokens from URL and exchanges them for a session
 */
const processCallback = async () => {
  try {
    isProcessing.value = true
    error.value = null

    // Check for error in URL params (OAuth error)
    if (route.query.error) {
      throw new Error(route.query.error_description || route.query.error)
    }

    // Check for access_token in URL hash or query params
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token') || route.query.access_token
    const refreshToken = hashParams.get('refresh_token') || route.query.refresh_token
    const type = hashParams.get('type') || route.query.type

    console.log('[AuthCallback] Processing callback:', { 
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      type 
    })

    // If we have tokens in URL, let Supabase handle the session exchange
    if (accessToken) {
      // Supabase SDK automatically processes the hash fragment
      // We just need to wait for the session to be established
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw sessionError
      }

      if (!session) {
        throw new Error('Failed to establish session after callback')
      }

      console.log('[AuthCallback] Session established:', session.user?.email)
      
      // Show success state briefly
      isSuccess.value = true
      isProcessing.value = false

      // Wait a moment then redirect
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirect to intended destination or home
      const redirectPath = route.query.redirect || sessionStorage.getItem('postAuthRedirect') || '/'
      sessionStorage.removeItem('postAuthRedirect')
      
      console.log('[AuthCallback] Redirecting to:', redirectPath)
      router.push(redirectPath)
    } else if (type === 'recovery') {
      // Password recovery flow
      // TODO: Implement password reset view
      console.log('[AuthCallback] Password recovery callback detected')
      router.push('/settings') // Redirect to settings for now
    } else {
      // No tokens found, might be an email confirmation
      // Check if there's a session anyway
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        isSuccess.value = true
        isProcessing.value = false
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.push('/')
      } else {
        throw new Error('No authentication data found in callback URL')
      }
    }
  } catch (err) {
    console.error('[AuthCallback] Error processing callback:', err)
    error.value = err.message || 'Failed to complete authentication. Please try again.'
    isProcessing.value = false
    isSuccess.value = false
  }
}

/**
 * Handles retry after error
 */
const handleRetry = () => {
  // Clear error and navigate back to auth screen
  error.value = null
  router.push('/auth')
}

// Process callback on mount
onMounted(() => {
  processCallback()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>