<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h2 class="
        text-2xl sm:text-3xl
        font-bold
        font-[family-name:var(--font-display)]
        text-[var(--color-card-foreground)]
        leading-tight
      ">
        Choose your sign-in method
      </h2>
      <p class="
        text-base
        text-[var(--color-muted-foreground)]/75
        leading-relaxed
      ">
        Select how you'd like to authenticate
      </p>
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="
        flex items-start gap-3
        p-4
        bg-[var(--color-destructive-500)]/16
        border border-[var(--color-destructive-500)]/38
        text-[var(--color-destructive-500)]/78
        rounded-[var(--radius-lg)]
      "
    >
      <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <p class="text-sm font-medium">{{ errorMessage }}</p>
    </div>

    <!-- Auth Method Cards -->
    <div class="mobile-card-stack">
      <!-- Email/Password Method -->
      <button
        @click="selectMethod('email')"
        :disabled="!!loadingMethod"
        class="auth-method-card animate-scale-in"
      >
        <div class="
          flex-shrink-0
          w-12 h-12
          flex items-center justify-center
          rounded-full
          bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)]
          text-white
        ">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24">
            <path 
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="flex-1 text-left">
          <p class="
            text-base
            font-semibold
            text-[var(--color-card-foreground)]
            leading-tight
          ">
            Continue with Email
          </p>
          <p class="
            text-sm
            text-[var(--color-muted-foreground)]
            leading-snug
          ">
            Sign in or create account
          </p>
        </div>
        <svg class="w-5 h-5 text-[var(--color-muted-foreground)]" fill="none" viewBox="0 0 24 24">
          <path 
            d="M9 5l7 7-7 7" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <!-- Google OAuth Method -->
      <button
        @click="selectMethod('google')"
        :disabled="!!loadingMethod"
        class="auth-method-card animate-scale-in"
        style="animation-delay: 100ms;"
      >
        <div class="
          flex-shrink-0
          w-12 h-12
          flex items-center justify-center
          rounded-full
          bg-white
          border border-[var(--color-border)]
        ">
          <!-- Loading spinner for Google -->
          <svg
            v-if="loadingMethod === 'google'"
            class="w-6 h-6 animate-spin text-[var(--color-brand-500)]"
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
          <!-- Google Icon - simplified placeholder -->
          <svg v-else class="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
        <div class="flex-1 text-left">
          <p class="
            text-base
            font-semibold
            text-[var(--color-card-foreground)]
            leading-tight
          ">
            Continue with Google
          </p>
          <p class="
            text-sm
            text-[var(--color-muted-foreground)]
            leading-snug
          ">
            Quick one-click sign in
          </p>
        </div>
        <svg class="w-5 h-5 text-[var(--color-muted-foreground)]" fill="none" viewBox="0 0 24 24">
          <path 
            d="M9 5l7 7-7 7" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <!-- Apple Sign In Method -->
      <button
        @click="selectMethod('apple')"
        :disabled="!!loadingMethod"
        class="auth-method-card animate-scale-in"
        style="animation-delay: 200ms;"
      >
        <div class="
          flex-shrink-0
          w-12 h-12
          flex items-center justify-center
          rounded-full
          bg-black
          dark:bg-white
        ">
          <!-- Loading spinner for Apple -->
          <svg
            v-if="loadingMethod === 'apple'"
            class="w-6 h-6 animate-spin text-white dark:text-black"
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
          <svg v-else class="w-6 h-6 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        </div>
        <div class="flex-1 text-left">
          <p class="
            text-base
            font-semibold
            text-[var(--color-card-foreground)]
            leading-tight
          ">
            Continue with Apple
          </p>
          <p class="
            text-sm
            text-[var(--color-muted-foreground)]
            leading-snug
          ">
            Secure iOS authentication
          </p>
        </div>
        <svg class="w-5 h-5 text-[var(--color-muted-foreground)]" fill="none" viewBox="0 0 24 24">
          <path 
            d="M9 5l7 7-7 7" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />
        </svg>
      </button>

    </div>

    <!-- Back to Landing -->
    <div class="pt-4">
      <button
        @click="handleBack"
        class="mobile-cta-secondary"
      >
        Back
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import authService from '@/services/authService'

const emit = defineEmits(['method-selected', 'back'])

const loadingMethod = ref(null) // Track which method is loading
const errorMessage = ref('')
const successMessage = ref('')

/**
 * Handles authentication method selection
 * For OAuth methods (Google, Apple), triggers provider flow immediately
 * For email/magic-link, emits event to show form
 * @param {string} method - Selected auth method ('email' | 'google' | 'apple' | 'magic-link')
 */
const selectMethod = async (method) => {
  console.log('[DEBUG] selectMethod called with:', method)
  console.log('[MobileAuthMethods] Method selected:', method)
  
  // Clear any previous messages
  errorMessage.value = ''
  successMessage.value = ''
  
  // For email, navigate to form
  console.log('[DEBUG] Emitting method-selected event for email')
  if (method === 'email') {
    emit('method-selected', method)
    return
  }
  
  // For OAuth methods, trigger authentication immediately
  loadingMethod.value = method
  
  try {
    let result
    
    if (method === 'google') {
      result = await authService.signInWithGoogle()
    } else if (method === 'apple') {
      result = await authService.signInWithApple()
    }
    
    if (!result.success) {
      errorMessage.value = result.error || `Failed to sign in with ${method}. Please try again.`
      loadingMethod.value = null
    }
    // If successful, the OAuth redirect will happen automatically
    // The callback will be handled by AuthCallback.vue
  } catch (error) {
    console.error(`[MobileAuthMethods] ${method} auth error:`, error)
    errorMessage.value = error.message || `An error occurred with ${method} sign in.`
    loadingMethod.value = null
  }
}

/**
 * Handles back navigation to landing
 */
const handleBack = () => {
  errorMessage.value = ''
  successMessage.value = ''
  emit('back')
}
</script>