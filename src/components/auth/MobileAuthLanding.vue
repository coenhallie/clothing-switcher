<template>
  <div class="flex flex-col gap-4 animate-fade-in">
    <!-- Biometric Login Button (if enabled) -->
    <button
      v-if="biometricEnabled"
      @click="handleBiometricLogin"
      :disabled="loadingBiometric"
      class="
        w-full
        flex items-center justify-center gap-3
        px-6 py-5
        bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500
        rounded-[var(--radius-lg)]
        text-white
        font-bold
        text-lg
        transition-all duration-200
        hover:opacity-90
        active:scale-[0.98]
        focus-visible:outline-none
        focus-visible:ring-4
        focus-visible:ring-[var(--color-brand-500)]/30
        disabled:opacity-50
        disabled:cursor-not-allowed
        shadow-lg
      "
    >
      <svg v-if="loadingBiometric" class="w-6 h-6 animate-spin" viewBox="0 0 24 24">
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
      <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>{{ loadingBiometric ? 'Authenticating...' : 'Sign in with Biometric' }}</span>
    </button>

    <!-- Divider (when biometric is enabled) -->
    <div v-if="biometricEnabled" class="relative py-1">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-[var(--color-border)]"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-4 bg-[var(--color-background)] text-[var(--color-muted-foreground)]">
          Or sign in with password
        </span>
      </div>
    </div>

    <!-- Email/Password Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Email Field -->
      <div class="space-y-2">
        <label
          for="auth-email"
          class="
            block
            text-sm
            font-semibold
            text-[var(--color-card-foreground)]/85
            tracking-wide
            mb-2
          "
        >
          Email Address
        </label>
        <input
          id="auth-email"
          v-model="formData.email"
          type="email"
          required
          autocomplete="email"
          class="mobile-input"
          :class="{ 'mobile-input--error': errors.email }"
          placeholder="you@example.com"
        />
        <p
          v-if="errors.email"
          class="
            flex items-center gap-2
            text-sm
            text-[var(--color-destructive-500)]/78
          "
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ errors.email }}</span>
        </p>
      </div>

      <!-- Password Field -->
      <div class="space-y-2">
        <div class="flex items-center justify-between mb-2">
          <label
            for="auth-password"
            class="
              text-sm
              font-semibold
              text-[var(--color-card-foreground)]/85
              tracking-wide
            "
          >
            Password
          </label>
          <button
            type="button"
            @click="handleForgotPassword"
            class="
              text-sm
              font-semibold
              text-[var(--color-brand-600)]/85
              hover:text-[var(--color-brand-500)]
              transition-colors
            "
          >
            Forgot?
          </button>
        </div>
        
        <div class="relative">
          <input
            id="auth-password"
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            required
            :autocomplete="isSignupMode ? 'new-password' : 'current-password'"
            class="mobile-input pr-12"
            :class="{ 'mobile-input--error': errors.password }"
            placeholder="Enter your password"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="
              absolute right-3 top-1/2 -translate-y-1/2
              p-2
              text-[var(--color-muted-foreground)]/70
              hover:text-[var(--color-card-foreground)]/80
              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-[var(--color-brand-500)]/22
              rounded-full
              transition-colors duration-200
            "
            aria-label="Toggle password visibility"
          >
            <svg v-if="showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <p
          v-if="errors.password"
          class="
            flex items-center gap-2
            text-sm
            text-[var(--color-destructive-500)]/78
          "
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ errors.password }}</span>
        </p>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading"
        class="mobile-cta-primary"
      >
        <svg
          v-if="loading"
          class="w-5 h-5 animate-spin text-white/80"
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
        <span v-else>{{ submitButtonText }}</span>
      </button>

      <!-- Toggle between login/signup -->
      <div class="text-center">
        <p class="text-sm text-[var(--color-muted-foreground)]">
          {{ isSignupMode ? 'Already have an account?' : "Don't have an account?" }}
          <button
            type="button"
            @click="toggleMode"
            class="
              font-semibold
              text-[var(--color-brand-600)]/85
              hover:text-[var(--color-brand-500)]
              transition-colors
              ml-1
            "
          >
            {{ isSignupMode ? 'Sign in' : 'Sign up' }}
          </button>
        </p>
      </div>

      <!-- Success message -->
      <div
        v-if="successMessage"
        class="
          flex items-start gap-3
          p-4
          bg-green-500/16
          border border-green-500/38
          text-green-600
          dark:text-green-400
          rounded-[var(--radius-lg)]
        "
      >
        <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
          <path
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p class="text-sm font-medium">{{ successMessage }}</p>
      </div>

      <!-- Error message -->
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
    </form>

    <!-- Divider -->
    <div class="relative py-1">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-[var(--color-border)]"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-4 bg-[var(--color-background)] text-[var(--color-muted-foreground)]">
          Or continue with
        </span>
      </div>
    </div>

    <!-- OAuth Buttons as Secondary Options -->
    <div class="space-y-2">
      <!-- Google OAuth Button -->
      <button
        @click="handleGoogleSignIn"
        :disabled="loadingGoogle"
        class="
          w-full
          flex items-center justify-center gap-3
          px-6 py-4
          bg-white
          border-2 border-[var(--color-border)]
          rounded-[var(--radius-lg)]
          text-gray-900
          font-semibold
          text-base
          transition-all duration-200
          hover:border-[var(--color-brand-500)]
          hover:bg-[var(--color-muted)]/30
          active:scale-[0.98]
          focus-visible:outline-none
          focus-visible:ring-4
          focus-visible:ring-[var(--color-brand-500)]/22
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        <!-- Loading spinner for Google -->
        <svg
          v-if="loadingGoogle"
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
        <!-- Google Icon -->
        <svg v-else class="w-6 h-6" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>{{ loadingGoogle ? 'Signing in...' : 'Google' }}</span>
      </button>
    </div>

    <!-- Legal/Terms Text -->
    <p class="
      mt-2
      text-xs
      text-[var(--color-muted-foreground)]/70
      leading-snug
      text-center
    ">
      By continuing, you agree to our Terms of Service and Privacy Policy
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useBiometricAuth } from '@/composables/useBiometricAuth'
import authService from '@/services/authService'

const emit = defineEmits(['google-auth-initiated'])

const router = useRouter()
const authStore = useAuthStore()
const { isBiometricEnabled, biometricLogin } = useBiometricAuth()

// Biometric state
const biometricEnabled = computed(() => isBiometricEnabled.value)
const loadingBiometric = ref(false)

// Form state
const formData = ref({
  email: '',
  password: ''
})

const errors = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const loadingGoogle = ref(false)
const showPassword = ref(false)
const isSignupMode = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Clear errors when user types
watch(() => formData.value.email, () => {
  errors.value.email = ''
  errorMessage.value = ''
})

watch(() => formData.value.password, () => {
  errors.value.password = ''
  errorMessage.value = ''
})

// Computed properties
const submitButtonText = computed(() => {
  if (loading.value) return 'Processing...'
  return isSignupMode.value ? 'Create Account' : 'Sign In'
})

/**
 * Validates form input
 */
const validateForm = () => {
  errors.value = { email: '', password: '' }
  errorMessage.value = ''
  
  let isValid = true
  
  // Email validation
  if (!formData.value.email) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }
  
  // Password validation
  if (!formData.value.password) {
    errors.value.password = 'Password is required'
    isValid = false
  } else if (isSignupMode.value && formData.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    isValid = false
  } else if (isSignupMode.value && formData.value.password.length > 72) {
    errors.value.password = 'Password must be less than 72 characters'
    isValid = false
  }
  
  return isValid
}

/**
 * Handles form submission
 */
const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    let result
    
    if (isSignupMode.value) {
      // Sign up
      result = await authStore.signUp(
        formData.value.email,
        formData.value.password
      )
      
      if (result.success) {
        successMessage.value = result.message || 'Account created! Please check your email to verify.'
      } else {
        errorMessage.value = result.error || 'Sign up failed. Please try again.'
      }
    } else {
      // Sign in
      result = await authStore.signIn(
        formData.value.email,
        formData.value.password
      )
      
      if (result.success) {
        // Auth store will handle navigation via auth state listener
        successMessage.value = 'Signed in successfully!'
        
        // Fallback navigation in case auth listener fails
        const redirectPath = router.currentRoute.value.query.redirect || '/';
        setTimeout(() => {
          router.push(redirectPath);
        }, 1200); // Delay to show success message before redirect
      } else {
        errorMessage.value = result.error || 'Sign in failed. Please check your credentials.'
      }
    }
  } catch (error) {
    console.error('[MobileAuthLanding] Form submission error:', error)
    errorMessage.value = error.message || 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

/**
 * Toggles between login and signup mode
 */
const toggleMode = () => {
  isSignupMode.value = !isSignupMode.value
  errors.value = { email: '', password: '' }
  errorMessage.value = ''
  successMessage.value = ''
  formData.value.password = '' // Clear password when toggling
}

/**
 * Handles forgot password
 */
const handleForgotPassword = () => {
  // TODO: Implement forgot password flow
  console.log('[MobileAuthLanding] Forgot password clicked')
}

/**
 * Handles Google OAuth sign in
 */
const handleGoogleSignIn = async () => {
  loadingGoogle.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const result = await authService.signInWithGoogle()
    
    if (!result.success) {
      errorMessage.value = result.error || 'Failed to sign in with Google. Please try again.'
      loadingGoogle.value = false
    }
    // If successful, OAuth redirect will happen automatically
    emit('google-auth-initiated')
  } catch (error) {
    console.error('[MobileAuthLanding] Google auth error:', error)
    errorMessage.value = error.message || 'An error occurred with Google sign in.'
    loadingGoogle.value = false
  }
}

/**
 * Handles biometric authentication
 */
const handleBiometricLogin = async () => {
  loadingBiometric.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const result = await biometricLogin()
    
    if (result.success) {
      successMessage.value = 'Signed in successfully!'
      
      // Navigate to home
      const redirectPath = router.currentRoute.value.query.redirect || '/';
      setTimeout(() => {
        router.push(redirectPath);
      }, 800);
    } else {
      errorMessage.value = result.error || 'Biometric authentication failed. Please use your password.'
    }
  } catch (error) {
    console.error('[MobileAuthLanding] Biometric login error:', error)
    errorMessage.value = error.message || 'Biometric authentication failed.'
  } finally {
    loadingBiometric.value = false
  }
}

</script>