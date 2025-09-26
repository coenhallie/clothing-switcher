<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 animate-fade-in"
    @click="handleOverlayClick"
  >
    <div class="auth-modal-panel animate-scale-in" @click.stop>
      <button
        type="button"
        @click="closeModal"
        class="auth-modal-close"
        aria-label="Close authentication modal"
      >
        <svg
          class="w-5 h-5"
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

      <div class="auth-modal-body">
        <LoginForm
          v-if="currentView === 'login'"
          ref="loginFormRef"
          @success="handleAuthSuccess"
          @switch-to-signup="switchToSignup"
          @forgot-password="switchToForgotPassword"
        />

        <SignupForm
          v-else-if="currentView === 'signup'"
          ref="signupFormRef"
          @success="handleSignupSuccess"
          @switch-to-login="switchToLogin"
        />

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

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  initialView: {
    type: String,
    default: 'login',
    validator: (value) =>
      ['login', 'signup', 'forgot-password'].includes(value),
  },
});

const emit = defineEmits(['close', 'auth-success', 'signup-success']);

const currentView = ref(props.initialView);

const loginFormRef = ref(null);
const signupFormRef = ref(null);
const forgotPasswordFormRef = ref(null);

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
      resetAllForms();
    }
  }
);

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
  console.log('🎉 [AuthModal] handleAuthSuccess called with result:', {
    hasUser: !!result.user,
    hasProfile: !!result.profile,
    userEmail: result.user?.email,
    profileCredits: result.profile?.credits,
  });
  emit('auth-success', result);
  closeModal();
};

const handleSignupSuccess = (result) => {
  emit('signup-success', result);
  setTimeout(() => {
    switchToLogin();
  }, 2000);
};

const handleForgotPasswordSuccess = () => {
  setTimeout(() => {
    switchToLogin();
  }, 2000);
};

const resetAllForms = () => {
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

defineExpose({
  switchToLogin,
  switchToSignup,
  switchToForgotPassword,
});
</script>
