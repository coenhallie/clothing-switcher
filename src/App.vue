<template>
  <!-- Conditional layout rendering based on platform detection -->
  <component :is="currentLayout">
    <!-- Header Actions Slot for both layouts -->
    <template #header-actions>
      <!-- Mobile Header Actions (Compact) -->
      <div v-if="isMobile" class="flex items-center gap-1.5">
            <div v-if="isAuthenticated" class="flex items-center gap-1.5">
              <button
                @click="openPurchaseCredits"
                class="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-xs font-semibold text-[var(--color-card-foreground)] transition active:scale-95"
                title="Purchase credits"
              >
                <span
                  class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand-500)] text-[0.625rem] text-white shadow-soft"
                >
                  {{ credits }}
                </span>
              </button>

              <button
                @click="toggleUserMenu"
                class="group inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-xs font-medium transition active:scale-95"
                aria-label="Open profile menu"
              >
                <div
                  class="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[color-mix(in_oklch,var(--color-brand-500)_24%,transparent)] text-[var(--color-brand-700)]"
                >
                  <span class="text-[0.625rem] font-semibold uppercase">
                    {{ avatarInitials }}
                  </span>
                </div>
                <svg
                  class="h-3 w-3 text-[var(--color-muted-foreground)] transition group-hover:text-[var(--color-brand-500)]"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div v-else class="flex items-center gap-1.5">
              <button
                @click="openAuthModal('login')"
                class="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-card-foreground)] transition active:scale-95"
              >
                Sign in
              </button>
              <button
                @click="openAuthModal('signup')"
                class="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-soft transition active:scale-95"
              >
                Start
              </button>
            </div>
      </div>

      <!-- Desktop Header Actions (Full Size) -->
      <div v-else class="flex items-center gap-3">
            <div v-if="isAuthenticated" class="flex items-center gap-2">
              <button
                @click="openPurchaseCredits"
                class="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold text-[var(--color-card-foreground)] transition hover:border-[var(--color-brand-500)] hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)] hover:text-[var(--color-brand-600)]"
                title="Purchase credits"
              >
                <span
                  class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand-500)] text-xs text-white shadow-soft"
                >
                  {{ credits }}
                </span>
                Credits
              </button>

              <div class="relative" ref="userMenuRef">
                <button
                  @click="toggleUserMenu"
                  class="group inline-flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium transition hover:border-[var(--color-brand-500)]"
                >
                  <div
                    class="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[color-mix(in_oklch,var(--color-brand-500)_24%,transparent)] text-[var(--color-brand-700)]"
                  >
                    <span class="text-sm font-semibold uppercase">
                      {{ avatarInitials }}
                    </span>
                  </div>
                  <div class="flex flex-col items-start leading-tight">
                    <span
                      class="text-sm font-semibold text-[var(--color-card-foreground)]"
                    >
                      {{ userName }}
                    </span>
                    <span
                      class="text-[11px] uppercase tracking-wide text-[var(--color-muted-foreground)]"
                    >
                      Member
                    </span>
                  </div>
                  <svg
                    class="h-4 w-4 text-[var(--color-muted-foreground)] transition group-hover:text-[var(--color-brand-500)]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>

                <div
                  v-if="showUserMenu"
                  class="absolute right-0 top-full z-[99999] mt-2 w-56 animate-scale-in overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-soft"
                >
                  <div class="border-b border-[var(--color-border)] px-4 py-3">
                    <p
                      class="text-sm font-medium text-[var(--color-card-foreground)]"
                    >
                      {{ userName }}
                    </p>
                    <p class="text-xs text-[var(--color-muted-foreground)]">
                      Dashboard access
                    </p>
                  </div>
                  <div class="flex flex-col py-2">
                    <button
                      @click="openPurchaseCredits"
                      class="flex items-center justify-between px-4 py-2 text-sm text-[var(--color-card-foreground)] transition hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)] hover:text-[var(--color-brand-600)]"
                    >
                      <span>Purchase credits</span>
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <path
                          d="M6 12h12m0 0-4-4m4 4-4 4"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      @click="cycleTheme"
                      class="flex items-center justify-between px-4 py-2 text-sm text-[var(--color-card-foreground)] transition hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)] hover:text-[var(--color-brand-600)]"
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class="relative flex h-4 w-4 items-center justify-center"
                        >
                          <svg
                            v-if="resolvedTheme === 'dark'"
                            class="h-4 w-4 text-[var(--color-brand-500)] transition"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                          <svg
                            v-else-if="resolvedTheme === 'light'"
                            class="h-4 w-4 text-[var(--color-brand-500)] transition"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="4"
                              stroke="currentColor"
                              stroke-width="1.5"
                            />
                            <path
                              d="M12 4V3M12 21v-1M4 12H3M21 12h-1M6.34 6.34 5.63 5.63M18.37 18.37l-.71-.71M6.34 17.66l-.71.71M18.37 5.63l-.71.71"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                            />
                          </svg>
                          <svg
                            v-else
                            class="h-4 w-4 text-[var(--color-brand-500)] transition"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M12 3v2m7 7h2m-9 7v2M3 12h2m12.364-6.364-1.414 1.414M6.05 17.95l-1.414 1.414m0-13.778 1.414 1.414m11.314 11.314 1.414 1.414"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="4"
                              stroke="currentColor"
                              stroke-width="1.5"
                            />
                          </svg>
                        </span>
                        <span class="capitalize">{{
                          themeLabelMap[theme]
                        }}</span>
                      </div>
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <path
                          d="M6 12h12m0 0-4-4m4 4-4 4"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                    <router-link
                      to="/settings"
                      class="flex items-center justify-between px-4 py-2 text-sm text-[var(--color-card-foreground)] transition hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)] hover:text-[var(--color-brand-600)]"
                      @click="closeUserMenu"
                    >
                      <span>Settings</span>
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <path
                          d="m9 9 6 6m0-6-6 6"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </router-link>
                  </div>
                  <div class="border-t border-[var(--color-border)]">
                    <button
                      @click="handleSignOut"
                      class="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-[var(--color-destructive-500)] transition hover:bg-[color-mix(in_oklch,var(--color-destructive-500)_15%,transparent)]"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <path
                          d="M9 6 5 6 5 18 9 18"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />
                        <path
                          d="M13 12h8m0 0-3-3m3 3-3 3"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="flex items-center gap-2">
              <button
                @click="openAuthModal('login')"
                class="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-card-foreground)] transition hover:border-[var(--color-brand-500)] hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)]"
              >
                Sign in
              </button>
              <button
                @click="openAuthModal('signup')"
                class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
              >
                Start for free
              </button>
            </div>
      </div>
    </template>

    <!-- Main Content Slot -->
    <router-view />
  </component>

    <AuthModal
      :is-open="showAuthModal"
      :initial-view="authModalView"
      @close="closeAuthModal"
      @auth-success="handleAuthSuccess"
      @signup-success="handleSignupSuccess"
    />

    <!-- Profile Bottom Sheet for Mobile -->
    <ProfileBottomSheet
      v-if="isMobile"
      :is-open="showUserMenu"
      :user-name="userName"
      :avatar-initials="avatarInitials"
      :credits="credits"
      :theme="theme"
      :resolved-theme="resolvedTheme"
      @close="closeUserMenu"
      @purchase-credits="openPurchaseCredits"
      @theme-toggle="cycleTheme"
      @sign-out="handleSignOut"
    />

    <div
      v-if="showPurchaseModal"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
      @click="closePurchaseModal"
    >
      <div
        class="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_48px_100px_-48px_rgba(30,41,59,0.45)] animate-scale-in flex flex-col"
        @click.stop
      >
        <div
          class="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4 flex-shrink-0"
        >
          <div>
            <p
              class="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-muted-foreground)]"
            >
              Credit marketplace
            </p>
            <h3
              class="text-lg font-semibold text-[var(--color-card-foreground)]"
            >
              Fuel your wardrobe generation
            </h3>
          </div>
          <button
            @click="closePurchaseModal"
            class="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-muted-foreground)] transition hover:border-[var(--color-destructive-500)] hover:text-[var(--color-destructive-500)]"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path
                d="M6 6l12 12M6 18 18 6"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <div class="px-6 py-6 overflow-y-auto flex-1">
          <PurchaseCredits
            @purchase-initiated="handlePurchaseInitiated"
            @purchase-completed="handlePurchaseCompleted"
          />
        </div>
      </div>
    </div>

    <div class="fixed right-6 top-6 z-[80] flex w-[320px] flex-col gap-3">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-soft animate-fade-in"
        :class="toastVariantClasses(toast.type)"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--color-muted)_40%,transparent)] group-[.toast-success]:bg-[color-mix(in_oklch,var(--color-brand-500)_20%,transparent)] group-[.toast-error]:bg-[color-mix(in_oklch,var(--color-destructive-500)_20%,transparent)] group-[.toast-warning]:bg-[color-mix(in_oklch,var(--color-warning-500)_25%,transparent)]"
          >
            <svg
              v-if="toast.type === 'success'"
              class="h-5 w-5 text-[var(--color-brand-600)]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5 12.5 9.5 17 19 7"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              class="h-5 w-5 text-[var(--color-destructive-500)]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="m8 8 8 8m0-8-8 8"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'warning'"
              class="h-5 w-5 text-[var(--color-warning-500)]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 9v4"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
              <path
                d="M12 3 2 21h20L12 3Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else
              class="h-5 w-5 text-[var(--color-brand-500)]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <circle cx="12" cy="7" r="1" fill="currentColor" />
              <path
                d="M11.25 10.5h1.5V17h-1.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="min-w-0 flex-1 space-y-1">
            <p
              class="text-sm font-semibold text-[var(--color-card-foreground)] line-clamp-2"
            >
              {{ toast.title }}
            </p>
            <p
              v-if="toast.message"
              class="text-sm text-[var(--color-muted-foreground)] leading-relaxed line-clamp-3"
            >
              {{ toast.message }}
            </p>
          </div>
          <button
            @click="removeToast(toast.id)"
            class="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-transparent text-[var(--color-muted-foreground)] transition hover:border-[var(--color-border)] hover:text-[var(--color-card-foreground)]"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path
                d="M6 6l12 12M6 18 18 6"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useAppStore } from './stores/app';
import { useAuthStore } from './stores/authStore';
import { useCreditStore } from './stores/creditStore';
import { useModals } from './composables/useModals';
import { usePlatform } from './composables/usePlatform';
import { useAppLifecycle } from './composables/useAppLifecycle';
import { useUserMenu } from './composables/useUserMenu';
import { useOverscrollPrevention } from './composables/useOverscrollPrevention';
import AuthModal from './components/auth/AuthModal.vue';
import PurchaseCredits from './components/credits/PurchaseCredits.vue';
import ProfileBottomSheet from './components/ProfileBottomSheet.vue';
import DesktopLayout from './components/layouts/DesktopLayout.vue';
import MobileLayout from './components/layouts/MobileLayout.vue';
import { TIMEOUTS, Z_INDEX } from './constants/index.js';
import { createLogger } from './utils/logger.js';

const route = useRoute();
const logger = createLogger('App');

const appStore = useAppStore();
const authStore = useAuthStore();
const creditStore = useCreditStore();

const { toasts, theme, resolvedTheme } = storeToRefs(appStore);
const { isMobile, isDesktop } = usePlatform();

const { removeToast, addToast, setTheme, teardownThemeWatcher } = appStore;

// Use composables for user menu and overscroll prevention
const {
  showUserMenu,
  userMenuRef,
  isAuthenticated,
  userName,
  credits,
  avatarInitials,
  toggleUserMenu,
  closeUserMenu,
  handleClickOutside,
} = useUserMenu();

useOverscrollPrevention();

// Dynamically select layout component based on platform
const currentLayout = computed(() => {
  return isMobile.value ? MobileLayout : DesktopLayout;
});

// Check if currently on mobile auth screen to suppress desktop modals
const isOnMobileAuthScreen = computed(() => {
  return isMobile.value && route.path === '/auth';
});

// Use the global modal composable
const {
  isAuthModalOpen: showAuthModal,
  isPurchaseModalOpen: showPurchaseModal,
  authModalMode: authModalView,
  openAuthModal,
  closeAuthModal,
  openPurchaseModal,
  closePurchaseModal,
} = useModals();

// Initialize app lifecycle management
const { initialize: initializeLifecycle, cleanup: cleanupLifecycle } = useAppLifecycle();

let authUnsubscribe = null;

const openPurchaseCredits = () => {
  openPurchaseModal();
  closeUserMenu();
};

const handleAuthSuccess = async () => {
  // Load credits first so we can show the count in the welcome message
  await creditStore.loadCredits();
  
  const creditCount = credits.value;
  const creditMsg = creditCount > 0
    ? `You have ${creditCount} credit${creditCount !== 1 ? 's' : ''} remaining!`
    : 'Your wardrobe hub is ready to explore.';
  
  addToast({
    type: 'success',
    title: 'Welcome back to SwitchFit.',
    message: creditMsg,
  });
  
  creditStore.initializeSubscriptions();
};

const handleSignupSuccess = () => {
  addToast({
    type: 'success',
    title: 'Account created successfully!',
    message: 'Verify your email to unlock your complimentary credit.',
  });
};

const handleSignOut = async () => {
  const result = await authStore.signOut();

  if (result.success) {
    addToast({
      type: 'success',
      title: 'Signed out',
      message: 'Your session ended securely.',
    });
    creditStore.reset();
  } else {
    addToast({
      type: 'error',
      title: 'Sign out failed',
      message: result.error,
    });
  }

  closeUserMenu();
};

const handlePurchaseInitiated = (packageItem) => {
  addToast({
    type: 'info',
    title: 'Redirecting to checkout',
    message: `Processing your purchase of ${packageItem.credits} credits.`,
  });
};

const handlePurchaseCompleted = (result) => {
  addToast({
    type: 'success',
    title: 'Credits added!',
    message: `${result.creditsAdded} new credits are available in your wallet.`,
  });
  closePurchaseModal();
  creditStore.loadCredits();
};

const handleOpenAuthModal = (event) => {
  // Suppress modal if on mobile auth screen
  if (isOnMobileAuthScreen.value) {
    console.log('[App] Skipping auth modal - mobile auth screen is active');
    return;
  }
  openAuthModal(event.detail || 'signup');
};

const handleOpenPurchaseModal = () => {
  openPurchaseCredits();
};

const themeLabelMap = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

const cycleTheme = () => {
  const modes = ['light', 'dark', 'system'];
  const current = theme.value ?? 'system';
  const next = modes[(modes.indexOf(current) + 1) % modes.length];
  setTheme(next);
};

const toastVariantClasses = (type) => {
  switch (type) {
    case 'success':
      return 'toast-success border-[color-mix(in_oklch,var(--color-brand-500)_45%,transparent)]';
    case 'error':
      return 'toast-error border-[color-mix(in_oklch,var(--color-destructive-500)_40%,transparent)]';
    case 'warning':
      return 'toast-warning border-[color-mix(in_oklch,var(--color-warning-500)_45%,transparent)]';
    default:
      return '';
  }
};

onMounted(async () => {
  // Add troubleshooting function to window for easy access
  if (typeof window !== 'undefined') {
    window.clearAuthData = async () => {
      logger.info('Clearing all authentication data...');
      const result = await authStore.clearAllAuthData();
      if (result.success) {
        logger.info('Authentication data cleared successfully. Please refresh the page.');
        window.location.reload();
      } else {
        logger.error('Failed to clear auth data:', result.error);
      }
      return result;
    };
    logger.debug('Troubleshooting: Run window.clearAuthData() in console to clear all auth data');
  }

  try {
    logger.info('Initializing application...');
    logger.debug('Initial localStorage state:', {
      totalKeys: Object.keys(localStorage).length,
      supabaseKeys: Object.keys(localStorage).filter(
        (key) => key.includes('supabase') || key.startsWith('sb-')
      ),
      authKeys: Object.keys(localStorage).filter((key) => key.includes('auth')),
    });

    // Initialize app store first
    logger.debug('Initializing app store...');
    appStore.initialize();

    // Check if logout is required (app was closed with authenticated user)
    logger.debug('Checking for logout-on-close flag...');
    const logoutRequired = authStore.shouldRequireAuth();
    
    if (logoutRequired) {
      logger.info('Logout flag detected - enforcing re-authentication');
      
      // Ensure all auth data is cleared
      await authStore.clearAllAuthData()
      
      logger.info('Auth data cleared - user must re-authenticate');
    } else {
      logger.debug('No logout flag - proceeding with normal session restoration');
    }

    // Early session restoration to support router guard logic
    // This will only succeed if user re-authenticates or no logout was required
    logger.debug('Attempting to restore existing session...');
    const sessionRestoreResult = await authStore.loadCurrentUser();

    logger.debug('Session restore result:', {
      success: sessionRestoreResult.success,
      hasUser: !!sessionRestoreResult.user,
      userEmail: sessionRestoreResult.user?.email,
      error: sessionRestoreResult.error,
      logoutWasRequired: logoutRequired,
    });

    // Initialize auth state listener after attempting session restore
    logger.debug('Initializing auth state listener...');
    authUnsubscribe = authStore.initializeAuth();

    // Wait a brief moment for any auth state changes to settle
    await new Promise((resolve) => setTimeout(resolve, TIMEOUTS.SESSION_CHECK_DELAY));

    logger.debug('Auth state after initialization:', {
      isAuthenticated: authStore.isAuthenticated,
      hasUser: !!authStore.user,
      hasProfile: !!authStore.profile,
      userEmail: authStore.user?.email,
    });

    if (authStore.isAuthenticated && authStore.user) {
      logger.info('User session detected:', {
        userEmail: authStore.user.email,
      });

      // Load credits if user is authenticated
      try {
        logger.debug('Loading credits for authenticated user...');
        await Promise.race([
          creditStore.loadCredits(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Credits timeout')), TIMEOUTS.CREDITS_TIMEOUT)
          ),
        ]);
        await creditStore.initializeSubscriptions();
        logger.debug('Credits loaded successfully');
      } catch (error) {
        logger.error('Failed to load credits:', error);
        // Don't block initialization for credit loading failures
      }
    } else {
      logger.debug('No active session detected');
    }

    // Initialize app lifecycle (handles logout on close and auto-login on startup)
    // Must be called AFTER session restoration to avoid duplicate session loading
    logger.debug('Initializing app lifecycle management...');
    await initializeLifecycle();

    // Set up event listeners
    logger.debug('Setting up event listeners...');
    document.addEventListener('click', handleClickOutside);

    logger.info('Application initialized successfully');
    logger.debug('Final auth state:', {
      isAuthenticated: authStore.isAuthenticated,
      hasUser: !!authStore.user,
      hasProfile: !!authStore.profile,
      userEmail: authStore.user?.email,
    });
  } catch (error) {
    logger.error('Failed to initialize app:', error);

    // Show user-friendly error message
    addToast({
      type: 'error',
      title: 'Initialization Error',
      message: 'There was a problem starting the app. Please refresh the page.',
    });
  } finally {
    logger.debug('Initialization complete');
  }
});

onUnmounted(() => {
  if (authUnsubscribe) {
    authUnsubscribe.data.subscription.unsubscribe();
  }
  creditStore.unsubscribeFromChanges();
  document.removeEventListener('click', handleClickOutside);
  teardownThemeWatcher();
  
  // Cleanup app lifecycle listeners
  cleanupLifecycle();
});
</script>

<style scoped>
@keyframes spin-slow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 1.2s linear infinite;
}
</style>

<style>
/*
 * CRITICAL: Native app-style scroll containment (MOBILE ONLY)
 * Based on how Telegram Web, Discord, and other native-feeling apps work
 * Desktop uses normal document scrolling
 */

/* Mobile-only: Fixed app container for mobile layouts with internal scroll containers */
@media (max-width: 767px) {
  #app {
    position: fixed;
    inset: 0;
    overflow: hidden;
    
    /* Prevent ANY overscroll at the app level */
    overscroll-behavior: none;
    -webkit-overscroll-behavior: none;
    
    /* Hardware acceleration */
    transform: translate3d(0, 0, 0);
    -webkit-transform: translate3d(0, 0, 0);
  }

  /* Ensure body doesn't interfere with fixed layout on mobile */
  body {
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
  }
}

/* Desktop: Allow normal scrolling */
@media (min-width: 768px) {
  #app {
    /* Prevent overscroll bounce on desktop */
    overscroll-behavior: none;
    -webkit-overscroll-behavior: none;
  }
}
</style>
