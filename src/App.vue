<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Loading overlay during auth initialization -->
    <div
      v-if="isInitializingAuth"
      class="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading...</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-xl font-bold text-gray-900">
              Clothing Switcher
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Navigation Links -->
            <router-link
              to="/"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              :class="{
                'text-blue-600 bg-blue-50': $route.name === 'TryOn',
              }"
            >
              Try-On
            </router-link>

            <!-- User Menu (when authenticated) -->
            <div v-if="isAuthenticated" class="flex items-center space-x-4">
              <!-- Credit Balance -->
              <div
                class="flex items-center space-x-2 bg-gray-100 rounded-md px-3 py-1"
              >
                <svg
                  class="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <span class="text-sm font-medium text-gray-900">{{
                  userCredits
                }}</span>
              </div>

              <!-- User Dropdown -->
              <div class="relative" ref="userMenuRef">
                <button
                  @click="toggleUserMenu"
                  class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <span>{{ userName }}</span>
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                >
                  <button
                    @click="openPurchaseCredits"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Buy Credits
                  </button>
                  <router-link
                    to="/settings"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="closeUserMenu"
                  >
                    Settings
                  </router-link>
                  <button
                    @click="handleSignOut"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            <!-- Auth Buttons (when not authenticated) -->
            <div v-else class="flex items-center space-x-2">
              <button
                @click="openAuthModal('login')"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </button>
              <button
                @click="openAuthModal('signup')"
                class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <router-view />

    <!-- Auth Modal -->
    <AuthModal
      :is-open="showAuthModal"
      :initial-view="authModalView"
      @close="closeAuthModal"
      @auth-success="handleAuthSuccess"
      @signup-success="handleSignupSuccess"
    />

    <!-- Purchase Credits Modal -->
    <div
      v-if="showPurchaseModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closePurchaseModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex justify-end p-4 pb-0">
          <button
            @click="closePurchaseModal"
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
        <div class="px-6 pb-6">
          <PurchaseCredits
            @purchase-initiated="handlePurchaseInitiated"
            @purchase-completed="handlePurchaseCompleted"
          />
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="bg-white rounded-lg shadow-lg border p-4 max-w-sm animate-slide-up"
        :class="{
          'border-green-200 bg-green-50': toast.type === 'success',
          'border-red-200 bg-red-50': toast.type === 'error',
          'border-yellow-200 bg-yellow-50': toast.type === 'warning',
          'border-blue-200 bg-blue-50': toast.type === 'info',
        }"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg
              v-if="toast.type === 'success'"
              class="w-5 h-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              class="w-5 h-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <p
              class="text-sm font-medium"
              :class="{
                'text-green-800': toast.type === 'success',
                'text-red-800': toast.type === 'error',
                'text-yellow-800': toast.type === 'warning',
                'text-blue-800': toast.type === 'info',
              }"
            >
              {{ toast.title }}
            </p>
            <p
              v-if="toast.message"
              class="mt-1 text-sm"
              :class="{
                'text-green-700': toast.type === 'success',
                'text-red-700': toast.type === 'error',
                'text-yellow-700': toast.type === 'warning',
                'text-blue-700': toast.type === 'info',
              }"
            >
              {{ toast.message }}
            </p>
          </div>
          <button
            @click="removeToast(toast.id)"
            class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from './stores/app';
import { useAuthStore } from './stores/authStore';
import { useCreditStore } from './stores/creditStore';
import AuthModal from './components/auth/AuthModal.vue';
import PurchaseCredits from './components/credits/PurchaseCredits.vue';

// Stores
const appStore = useAppStore();
const authStore = useAuthStore();
const creditStore = useCreditStore();

// Store refs
const { toasts } = storeToRefs(appStore);
const { isAuthenticated, userName, userCredits } = storeToRefs(authStore);

// Store actions
const { removeToast, addToast } = appStore;

// Reactive state
const showAuthModal = ref(false);
const authModalView = ref('login');
const showPurchaseModal = ref(false);
const showUserMenu = ref(false);
const userMenuRef = ref(null);
const isInitializingAuth = ref(true);

// Auth subscription
let authUnsubscribe = null;

// Methods
const openAuthModal = (view = 'login') => {
  authModalView.value = view;
  showAuthModal.value = true;
};

const closeAuthModal = () => {
  showAuthModal.value = false;
};

const openPurchaseCredits = () => {
  showPurchaseModal.value = true;
  closeUserMenu();
};

const closePurchaseModal = () => {
  showPurchaseModal.value = false;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const closeUserMenu = () => {
  showUserMenu.value = false;
};

const handleAuthSuccess = (result) => {
  addToast({
    type: 'success',
    title: 'Welcome!',
    message: 'You have successfully signed in.',
  });

  // Load user data
  creditStore.loadCredits();
  creditStore.initializeSubscriptions();
};

const handleSignupSuccess = (result) => {
  addToast({
    type: 'success',
    title: 'Account Created!',
    message: 'Please check your email to verify your account.',
  });
};

const handleSignOut = async () => {
  const result = await authStore.signOut();

  if (result.success) {
    addToast({
      type: 'success',
      title: 'Signed Out',
      message: 'You have been successfully signed out.',
    });

    // Reset credit store
    creditStore.reset();
  } else {
    addToast({
      type: 'error',
      title: 'Sign Out Failed',
      message: result.error,
    });
  }

  closeUserMenu();
};

const handlePurchaseInitiated = (package_item) => {
  addToast({
    type: 'info',
    title: 'Redirecting to Payment',
    message: `Processing purchase of ${package_item.credits} credits...`,
  });
};

const handlePurchaseCompleted = (result) => {
  addToast({
    type: 'success',
    title: 'Purchase Successful!',
    message: `${result.creditsAdded} credits have been added to your account.`,
  });

  closePurchaseModal();
  creditStore.loadCredits();
};

// Click outside handler for user menu
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    closeUserMenu();
  }
};

// Handle custom events from child components
const handleOpenAuthModal = (event) => {
  openAuthModal(event.detail || 'signup');
};

const handleOpenPurchaseModal = () => {
  openPurchaseCredits();
};

// Initialize the app
onMounted(async () => {
  try {
    // Initialize legacy app store
    appStore.initialize();

    // Initialize auth state listener first
    authUnsubscribe = authStore.initializeAuth();

    // Load current user with better error handling
    const userResult = await authStore.loadCurrentUser();

    // If there was an error but it's not critical (like no session), continue
    if (!userResult.success && userResult.error) {
      console.log('No existing session found, user will need to log in');
    }

    // If user is authenticated, load credits and setup subscriptions
    if (isAuthenticated.value) {
      try {
        await creditStore.loadCredits();
        creditStore.initializeSubscriptions();
      } catch (error) {
        console.error('Failed to load user credits:', error);
        // Don't block the app if credits fail to load
      }
    }

    // Add click outside listener
    document.addEventListener('click', handleClickOutside);

    // Add custom event listeners
    window.addEventListener('open-auth-modal', handleOpenAuthModal);
    window.addEventListener('open-purchase-modal', handleOpenPurchaseModal);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // App should still be usable even if initialization partially fails
  } finally {
    // Always hide loading state
    isInitializingAuth.value = false;
  }
});

onUnmounted(() => {
  // Cleanup
  if (authUnsubscribe) {
    authUnsubscribe.data.subscription.unsubscribe();
  }

  creditStore.unsubscribeFromChanges();
  document.removeEventListener('click', handleClickOutside);

  // Remove custom event listeners
  window.removeEventListener('open-auth-modal', handleOpenAuthModal);
  window.removeEventListener('open-purchase-modal', handleOpenPurchaseModal);
});
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
