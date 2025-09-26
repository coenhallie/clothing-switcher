<template>
  <div class="auth-panel">
    <header class="auth-panel__header">
      <h2 class="auth-panel__title">Reset Password</h2>
      <p class="auth-panel__subtitle">
        Enter the email address associated with your account and we will send
        you a secure reset link.
      </p>
    </header>

    <form @submit.prevent="handleSubmit" class="auth-panel__form">
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
          placeholder="you@example.com"
          :class="[
            'auth-panel__input',
            { 'auth-panel__input--error': errors.email },
          ]"
        />
        <p v-if="errors.email" class="auth-panel__feedback">
          {{ errors.email }}
        </p>
        <p class="auth-panel__helper">
          We will send the reset instructions to this address.
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
        :disabled="isLoading || successMessage"
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
          Sending Reset Link...
        </span>
        <span v-else-if="successMessage">Email Sent</span>
        <span v-else>Send Reset Link</span>
      </button>

      <div class="auth-panel__footer">
        <button
          type="button"
          class="auth-panel__link-btn"
          @click="$emit('switch-to-login')"
        >
          ← Back to Sign In
        </button>
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
  email: '',
});

const errors = reactive({
  email: '',
});

const isLoading = ref(false);
const error = ref('');
const successMessage = ref('');

const validateForm = () => {
  errors.email = '';

  if (!form.email) {
    errors.email = 'Email is required';
    return false;
  }

  if (!form.email.includes('@')) {
    errors.email = 'Please enter a valid email';
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
    const result = await authStore.resetPassword(form.email);

    if (result.success) {
      successMessage.value = result.message;
      emit('success', result);
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
  form.email = '';
  errors.email = '';
  error.value = '';
  successMessage.value = '';
};

defineExpose({
  resetForm,
});
</script>
