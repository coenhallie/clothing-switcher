<template>
  <div class="auth-panel">
    <header class="auth-panel__header">
      <h2 class="auth-panel__title">Sign In</h2>
      <p class="auth-panel__subtitle">
        Welcome back. Continue transforming outfits with your personalized
        wardrobe assistant.
      </p>
    </header>

    <form @submit.prevent="handleSubmit" class="auth-panel__form">
      <div class="auth-panel__field">
        <label for="email" class="auth-panel__label">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          autocomplete="email"
          placeholder="you@example.com"
          :class="[
            'auth-panel__input',
            { 'auth-panel__input--error': errors.email },
          ]"
        />
        <p v-if="errors.email" class="auth-panel__feedback">
          {{ errors.email }}
        </p>
      </div>

      <div class="auth-panel__field">
        <label for="password" class="auth-panel__label"> Password </label>
        <div class="auth-panel__input-wrapper">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            :class="[
              'auth-panel__input',
              { 'auth-panel__input--error': errors.password },
            ]"
          />
          <button
            type="button"
            class="auth-panel__password-toggle"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <svg
              v-if="showPassword"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
              />
            </svg>
            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
        <p v-if="errors.password" class="auth-panel__feedback">
          {{ errors.password }}
        </p>
      </div>

      <div
        v-if="error"
        class="auth-panel__message auth-panel__message--error"
        role="alert"
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ error }}</span>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="auth-panel__primary-btn"
      >
        <span v-if="isLoading" class="flex items-center gap-2">
          <svg
            class="auth-panel__spinner animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Signing In...
        </span>
        <span v-else>Sign In</span>
      </button>

      <div class="auth-panel__footer">
        <button
          type="button"
          class="auth-panel__link-btn"
          @click="$emit('forgot-password')"
        >
          Forgot your password?
        </button>
        <div>
          <span>Don't have an account?</span>
          <button
            type="button"
            class="auth-panel__toggle"
            @click="$emit('switch-to-signup')"
          >
            Create one
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../../stores/authStore.js';

const emit = defineEmits(['success', 'switch-to-signup', 'forgot-password']);

const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
});

const errors = reactive({
  email: '',
  password: '',
});

const showPassword = ref(false);
const isLoading = ref(false);
const error = ref('');

const validateForm = () => {
  errors.email = '';
  errors.password = '';

  if (!form.email) {
    errors.email = 'Email is required';
    return false;
  }

  if (!form.email.includes('@')) {
    errors.email = 'Please enter a valid email';
    return false;
  }

  if (!form.password) {
    errors.password = 'Password is required';
    return false;
  }

  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  console.log('🔐 [LoginForm] Form submission started');
  console.log('🔐 [LoginForm] Form data:', {
    email: form.email,
    passwordLength: form.password.length,
    timestamp: new Date().toISOString(),
  });

  if (!validateForm()) {
    console.log('🔐 [LoginForm] Form validation failed');
    return;
  }

  console.log('🔐 [LoginForm] Form validation passed, starting authentication');

  // Check local storage state before sign in
  console.log(
    '🔐 [LoginForm] Local storage keys before sign in:',
    Object.keys(localStorage)
  );
  const supabaseKeys = Object.keys(localStorage).filter(
    (key) => key.includes('supabase') || key.startsWith('sb-')
  );
  console.log(
    '🔐 [LoginForm] Supabase-related localStorage keys:',
    supabaseKeys
  );

  isLoading.value = true;
  error.value = '';

  try {
    console.log('🔐 [LoginForm] Calling authStore.signIn...');
    const result = await authStore.signIn(form.email, form.password);

    console.log('🔐 [LoginForm] AuthStore signIn result:', {
      success: result.success,
      hasUser: !!result.user,
      hasProfile: !!result.profile,
      error: result.error,
    });

    if (result.success) {
      console.log('🔐 [LoginForm] Sign in successful, emitting success event');
      emit('success', result);
    } else {
      console.log('🔐 [LoginForm] Sign in failed:', result.error);
      error.value = result.error;
    }
  } catch (err) {
    console.error('🔐 [LoginForm] Sign in exception:', err);
    error.value = err.message || 'An unexpected error occurred';
  } finally {
    console.log('🔐 [LoginForm] Setting loading to false');
    isLoading.value = false;

    // Check local storage state after sign in attempt
    console.log(
      '🔐 [LoginForm] Local storage keys after sign in:',
      Object.keys(localStorage)
    );
    const supabaseKeysAfter = Object.keys(localStorage).filter(
      (key) => key.includes('supabase') || key.startsWith('sb-')
    );
    console.log(
      '🔐 [LoginForm] Supabase-related localStorage keys after:',
      supabaseKeysAfter
    );
  }
};

const resetForm = () => {
  form.email = '';
  form.password = '';
  errors.email = '';
  errors.password = '';
  error.value = '';
  showPassword.value = false;
};

defineExpose({
  resetForm,
});
</script>
