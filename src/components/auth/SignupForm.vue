<template>
  <div class="auth-panel">
    <header class="auth-panel__header">
      <h2 class="auth-panel__title">Create Account</h2>
      <p class="auth-panel__subtitle">
        Join the community and start remixing outfits with AI-enhanced styling.
      </p>
    </header>

    <div class="auth-panel__highlight">
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      <span
        ><strong>Bonus:</strong> Unlock 2 free credit the moment you sign
        up.</span
      >
    </div>

    <form @submit.prevent="handleSubmit" class="auth-panel__form">
      <div class="auth-panel__field">
        <label for="fullName" class="auth-panel__label">
          Full Name
          <span>Optional</span>
        </label>
        <input
          id="fullName"
          v-model="form.fullName"
          type="text"
          autocomplete="name"
          placeholder=""
          class="auth-panel__input"
        />
      </div>

      <div class="auth-panel__field">
        <label for="email" class="auth-panel__label">
          Email
          <span>Required</span>
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          autocomplete="email"
          placeholder=""
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
        <label for="password" class="auth-panel__label">
          Password
          <span>Minimum 6 characters</span>
        </label>
        <div class="auth-panel__input-wrapper">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="new-password"
            placeholder="Create a secure password"
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
        <p class="auth-panel__helper">
          Password must be at least 6 characters long.
        </p>
      </div>

      <div class="auth-panel__field">
        <label for="confirmPassword" class="auth-panel__label">
          Confirm Password
          <span>Required</span>
        </label>
        <div class="auth-panel__input-wrapper">
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            required
            autocomplete="new-password"
            placeholder="Repeat your password"
            :class="[
              'auth-panel__input',
              { 'auth-panel__input--error': errors.confirmPassword },
            ]"
          />
          <button
            type="button"
            class="auth-panel__password-toggle"
            @click="showConfirmPassword = !showConfirmPassword"
            :aria-label="
              showConfirmPassword ? 'Hide password' : 'Show password'
            "
          >
            <svg
              v-if="showConfirmPassword"
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
        <p v-if="errors.confirmPassword" class="auth-panel__feedback">
          {{ errors.confirmPassword }}
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

      <div
        v-if="successMessage"
        class="auth-panel__message auth-panel__message--success"
        role="status"
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ successMessage }}</span>
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
          Creating Account...
        </span>
        <span v-else>Create Account</span>
      </button>

      <div class="auth-panel__footer">
        <div>
          <span>Already have an account?</span>
          <button
            type="button"
            class="auth-panel__toggle"
            @click="$emit('switch-to-login')"
          >
            Sign in
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../../stores/authStore.js';

const emit = defineEmits(['success', 'switch-to-login']);

const authStore = useAuthStore();

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const error = ref('');
const successMessage = ref('');

const validateForm = () => {
  errors.email = '';
  errors.password = '';
  errors.confirmPassword = '';

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

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
    return false;
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  error.value = '';
  successMessage.value = '';

  try {
    const result = await authStore.signUp(
      form.email,
      form.password,
      form.fullName
    );

    if (result.success) {
      successMessage.value = result.message;
      setTimeout(() => {
        resetForm();
        emit('success', result);
      }, 2000);
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = err.message || 'An unexpected error occurred';
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  form.fullName = '';
  form.email = '';
  form.password = '';
  form.confirmPassword = '';
  errors.email = '';
  errors.password = '';
  errors.confirmPassword = '';
  error.value = '';
  successMessage.value = '';
  showPassword.value = false;
  showConfirmPassword.value = false;
};

defineExpose({
  resetForm,
});
</script>
