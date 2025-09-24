<template>
  <!-- Modal Overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="handleOverlayClick"
  >
    <!-- Modal Content -->
    <div
      class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Close Button -->
      <div class="flex justify-end p-4 pb-0">
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="px-6 pb-6">
        <!-- Login Form -->
        <LoginForm
          v-if="currentView === 'login'"
          ref="loginFormRef"
          @success="handleAuthSuccess"
          @switch-to-signup="switchToSignup"
          @forgot-password="switchToForgotPassword"
        />

        <!-- Signup Form -->
        <SignupForm
          v-else-if="currentView === 'signup'"
          ref="signupFormRef"
          @success="handleSignupSuccess"
          @switch-to-login="switchToLogin"
        />

        <!-- Forgot Password Form -->
        <ForgotPasswordForm
          v-else-if="currentView === 'forgot-password'"
          ref="forgotPasswordFormRef"
          @success="handleForgotPasswordSuccess"
          @switch-to-login="switchToLogin"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import LoginForm from './LoginForm.vue';
import SignupForm from './SignupForm.vue';
import ForgotPasswordForm from './ForgotPasswordForm.vue';

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  initialView: {
    type: String,
    default: 'login', // 'login', 'signup', 'forgot-password'
    validator: (value) =>
      ['login', 'signup', 'forgot-password'].includes(value),
  },
});

// Emits
const emit = defineEmits(['close', 'auth-success', 'signup-success']);

// Reactive state
const currentView = ref(props.initialView);

// Refs for form components
const loginFormRef = ref(null);
const signupFormRef = ref(null);
const forgotPasswordFormRef = ref(null);

// Watch for prop changes
watch(
  () => props.initialView,
  (newView) => {
    currentView.value = newView;
  }
);

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      // Reset forms when modal opens
      resetAllForms();
    }
  }
);

// Methods
const closeModal = () => {
  emit('close');
};

const handleOverlayClick = () => {
  closeModal();
};

const switchToLogin = () => {
  currentView.value = 'login';
  resetAllForms();
};

const switchToSignup = () => {
  currentView.value = 'signup';
  resetAllForms();
};

const switchToForgotPassword = () => {
  currentView.value = 'forgot-password';
  resetAllForms();
};

const handleAuthSuccess = (result) => {
  emit('auth-success', result);
  closeModal();
};

const handleSignupSuccess = (result) => {
  emit('signup-success', result);
  // Don't close modal immediately, let user see success message
  setTimeout(() => {
    switchToLogin();
  }, 2000);
};

const handleForgotPasswordSuccess = (result) => {
  // Show success message and switch back to login
  setTimeout(() => {
    switchToLogin();
  }, 2000);
};

const resetAllForms = () => {
  // Reset all forms when switching views
  setTimeout(() => {
    if (loginFormRef.value) {
      loginFormRef.value.resetForm();
    }
    if (signupFormRef.value) {
      signupFormRef.value.resetForm();
    }
    if (forgotPasswordFormRef.value) {
      forgotPasswordFormRef.value.resetForm();
    }
  }, 100);
};

// Expose methods
defineExpose({
  switchToLogin,
  switchToSignup,
  switchToForgotPassword,
});
</script>

<style scoped>
/* Custom scrollbar for modal content */
.max-h-\[90vh\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[90vh\]::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.max-h-\[90vh\]::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.max-h-\[90vh\]::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
