<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header with back button -->
    <div class="flex items-center justify-between">
      <button
        @click="handleBack"
        class="
          inline-flex items-center gap-2
          p-2
          text-[var(--color-muted-foreground)]
          rounded-full
          transition-all duration-200
          hover:text-[var(--color-card-foreground)]
          hover:bg-[var(--color-muted)]
          active:scale-95
          focus-visible:outline-none
          focus-visible:ring-4
          focus-visible:ring-[var(--color-brand-500)]/22
        "
        aria-label="Go back"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
          <path 
            d="M15 19l-7-7 7-7" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />
        </svg>
        <span class="text-sm font-medium">Back</span>
      </button>
    </div>

    <!-- Title based on selected method -->
    <div class="text-center space-y-2">
      <h2 class="
        text-2xl sm:text-3xl
        font-bold
        font-[family-name:var(--font-display)]
        text-[var(--color-card-foreground)]
        leading-tight
      ">
        {{ formTitle }}
      </h2>
      <p class="
        text-base
        text-[var(--color-muted-foreground)]/75
        leading-relaxed
      ">
        {{ formSubtitle }}
      </p>
    </div>

    <!-- Form Content Slot -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
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
            mt-2
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
            autocomplete="current-password"
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
            mt-2
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

      <!-- Toggle between login/signup (for email method) -->
      <div v-if="selectedMethod === 'email'" class="text-center">
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

      <!-- General error message -->
      <div
        v-if="generalError"
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
        <p class="text-sm font-medium">{{ generalError }}</p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import authService from '@/services/authService'

// TODO: Add password strength indicator for signup mode

const props = defineProps({
  selectedMethod: {
    type: String,
    required: true,
    validator: (value) => ['email'].includes(value)
  },
  mode: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'signup'].includes(value)
  }
})

const emit = defineEmits(['form-submitted', 'back', 'forgot-password'])

const authStore = useAuthStore()

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
const showPassword = ref(false)
const isSignupMode = ref(props.mode === 'signup')
const generalError = ref('')
const successMessage = ref('')

// Watch for mode prop changes
watch(() => props.mode, (newMode) => {
  isSignupMode.value = newMode === 'signup'
  errors.value = { email: '', password: '' }
  generalError.value = ''
  successMessage.value = ''
})

// Clear errors when user types
watch(() => formData.value.email, () => {
  errors.value.email = ''
  generalError.value = ''
})

watch(() => formData.value.password, () => {
  errors.value.password = ''
  generalError.value = ''
})

// Computed properties
const formTitle = computed(() => {
  return isSignupMode.value ? 'Create your account' : 'Welcome back'
})

const formSubtitle = computed(() => {
  return isSignupMode.value
    ? 'Get started with your free account'
    : 'Sign in to continue your journey'
})

const submitButtonText = computed(() => {
  if (loading.value) return 'Processing...'
  return isSignupMode.value ? 'Create Account' : 'Sign In'
})

/**
 * Validates form input with proper email regex and password requirements
 */
const validateForm = () => {
  errors.value = { email: '', password: '' }
  generalError.value = ''
  
  let isValid = true
  
  // Email validation
  if (!formData.value.email) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }
  
  // Password validation (only for email method)
  if (props.selectedMethod === 'email') {
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
  }
  
  return isValid
}

/**
 * Handles form submission - calls appropriate authService method based on mode
 */
const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  generalError.value = ''
  successMessage.value = ''
  
  try {
    let result
    
    if (props.selectedMethod === 'email') {
      if (isSignupMode.value) {
        // Sign up
        result = await authStore.signUp(
          formData.value.email,
          formData.value.password
        )
        
        if (result.success) {
          successMessage.value = result.message || 'Account created! Please check your email to verify.'
          emit('form-submitted', { mode: 'signup', email: formData.value.email })
        } else {
          generalError.value = result.error || 'Sign up failed. Please try again.'
        }
      } else {
        // Sign in
        result = await authStore.signIn(
          formData.value.email,
          formData.value.password
        )
        
        if (result.success) {
          // Auth store will handle navigation via auth state listener
          emit('form-submitted', { mode: 'login', email: formData.value.email })
        } else {
          generalError.value = result.error || 'Sign in failed. Please check your credentials.'
        }
      }
    }
  } catch (error) {
    console.error('[MobileAuthForm] Form submission error:', error)
    generalError.value = error.message || 'An error occurred. Please try again.'
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
  generalError.value = ''
  successMessage.value = ''
  formData.value.password = '' // Clear password when toggling
}

/**
 * Handles back navigation
 */
const handleBack = () => {
  emit('back')
}

/**
 * Handles forgot password
 * TODO: Implement forgot password flow
 */
const handleForgotPassword = () => {
  emit('forgot-password')
}

/**
 * Resets the form
 */
const resetForm = () => {
  formData.value = { email: '', password: '' }
  errors.value = { email: '', password: '' }
  generalError.value = ''
  successMessage.value = ''
  loading.value = false
  showPassword.value = false
  isSignupMode.value = props.mode === 'signup'
}

// Expose methods for parent component
defineExpose({
  resetForm
})
</script>