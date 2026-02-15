<template>
  <!-- Conditional layout rendering based on platform detection -->
  <component :is="currentLayout">
    <!-- Header Actions Slot for both layouts -->
    <template #header-actions>
      <!-- Mobile Header Actions -->
      <div v-if="isMobile" class="flex items-center gap-1">
            <div v-if="isAuthenticated" class="flex items-center gap-1">
              <button
                @click="openPurchaseCredits"
                class="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2 py-1 text-[11px] font-medium text-[var(--color-card-foreground)] transition active:scale-95"
                title="Credits"
              >
                <span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-foreground)] text-[9px] font-medium text-[var(--color-background)]">
                  {{ credits }}
                </span>
              </button>

              <button
                @click="toggleUserMenu"
                class="inline-flex items-center gap-0.5 rounded-md border border-[var(--color-border)] px-1.5 py-1 text-[11px] font-medium transition active:scale-95"
                aria-label="Open profile menu"
              >
                <div class="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-muted)] text-[var(--color-card-foreground)]">
                  <span class="text-[9px] font-semibold uppercase">{{ avatarInitials }}</span>
                </div>
              </button>
            </div>

            <div v-else class="flex items-center gap-1">
              <button
                @click="openAuthModal('login')"
                class="inline-flex items-center rounded-md border border-[var(--color-border)] px-2 py-1 text-[11px] font-medium text-[var(--color-card-foreground)] transition active:scale-95"
              >
                Sign in
              </button>
              <button
                @click="openAuthModal('signup')"
                class="inline-flex items-center rounded-md bg-[var(--color-foreground)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-background)] transition active:scale-95"
              >
                Start
              </button>
            </div>
      </div>

      <!-- Desktop Header Actions -->
      <div v-else class="flex items-center gap-2">
            <div v-if="isAuthenticated" class="flex items-center gap-1.5">
              <button
                @click="openPurchaseCredits"
                class="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-card-foreground)] transition hover:border-[var(--color-foreground)]"
                title="Credits"
              >
                <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-foreground)] text-[10px] font-medium text-[var(--color-background)]">
                  {{ credits }}
                </span>
                Credits
              </button>

              <div class="relative" ref="userMenuRef">
                <button
                  @click="toggleUserMenu"
                  class="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium transition hover:border-[var(--color-foreground)]"
                >
                  <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-muted)] text-[var(--color-card-foreground)]">
                    <span class="text-[10px] font-semibold uppercase">{{ avatarInitials }}</span>
                  </div>
                  <span class="text-xs text-[var(--color-card-foreground)]">{{ userName }}</span>
                  <svg class="h-3 w-3 text-[var(--color-muted-foreground)]" fill="none" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>

                <div
                  v-if="showUserMenu"
                  class="absolute right-0 top-full z-[99999] mt-1 w-48 animate-scale-in overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-elevated"
                >
                  <div class="border-b border-[var(--color-border)] px-3 py-2">
                    <p class="text-xs font-medium text-[var(--color-card-foreground)]">{{ userName }}</p>
                    <p class="text-[11px] text-[var(--color-muted-foreground)]">{{ credits }} credits</p>
                  </div>
                  <div class="flex flex-col py-1">
                    <button
                      @click="openPurchaseCredits"
                      class="flex items-center px-3 py-1.5 text-xs text-[var(--color-card-foreground)] transition hover:bg-[var(--color-muted)]"
                    >
                      Purchase credits
                    </button>
                    <button
                      @click="cycleTheme"
                      class="flex items-center justify-between px-3 py-1.5 text-xs text-[var(--color-card-foreground)] transition hover:bg-[var(--color-muted)]"
                    >
                      <span>{{ themeLabelMap[theme] }}</span>
                    </button>
                    <router-link
                      to="/settings"
                      class="flex items-center px-3 py-1.5 text-xs text-[var(--color-card-foreground)] transition hover:bg-[var(--color-muted)]"
                      @click="closeUserMenu"
                    >
                      Settings
                    </router-link>
                  </div>
                  <div class="border-t border-[var(--color-border)]">
                    <button
                      @click="handleSignOut"
                      class="flex w-full items-center gap-1.5 px-3 py-2 text-xs font-medium text-[var(--color-destructive-500)] transition hover:bg-[oklch(0.58_0.22_27_/_0.04)]"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="flex items-center gap-1.5">
              <button
                @click="openAuthModal('login')"
                class="inline-flex items-center rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-card-foreground)] transition hover:border-[var(--color-foreground)]"
              >
                Sign in
              </button>
              <button
                @click="openAuthModal('signup')"
                class="inline-flex items-center rounded-md bg-[var(--color-foreground)] px-3 py-1.5 text-xs font-medium text-[var(--color-background)] transition hover:opacity-88"
              >
                Get started
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

    <!-- Welcome Modal -->
    <WelcomeModal
      :is-open="showWelcomeModal"
      @close="handleWelcomeClose"
      @get-started="handleWelcomeGetStarted"
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

    <!-- Purchase Modal -->
    <div
      v-if="showPurchaseModal"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      @click="closePurchaseModal"
    >
      <div
        class="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-elevated animate-scale-in flex flex-col"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3 flex-shrink-0">
          <div>
            <h3 class="text-sm font-semibold text-[var(--color-card-foreground)]">Purchase credits</h3>
            <p class="text-xs text-[var(--color-muted-foreground)]">Add credits to generate more looks.</p>
          </div>
          <button
            @click="closePurchaseModal"
            class="flex items-center justify-center w-7 h-7 rounded-md text-[var(--color-muted-foreground)] transition hover:text-[var(--color-card-foreground)] hover:bg-[var(--color-muted)]"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path d="M6 6l12 12M6 18 18 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <div class="px-5 py-5 overflow-y-auto flex-1">
          <PurchaseCredits
            @purchase-initiated="handlePurchaseInitiated"
            @purchase-completed="handlePurchaseCompleted"
          />
        </div>
      </div>
    </div>

    <!-- Toast Container -->
    <div class="fixed right-4 top-4 z-[80] flex w-[280px] flex-col gap-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="overflow-hidden rounded-lg border bg-[var(--color-surface)] p-3 shadow-elevated animate-fade-in"
        :class="toastVariantClasses(toast.type)"
      >
        <div class="flex items-start gap-2">
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-[var(--color-card-foreground)] line-clamp-2">
              {{ toast.title }}
            </p>
            <p
              v-if="toast.message"
              class="text-[11px] text-[var(--color-muted-foreground)] leading-relaxed mt-0.5 line-clamp-2"
            >
              {{ toast.message }}
            </p>
          </div>
          <button
            @click="removeToast(toast.id)"
            class="flex h-5 w-5 flex-none items-center justify-center rounded text-[var(--color-muted-foreground)] transition hover:text-[var(--color-card-foreground)]"
          >
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24">
              <path d="M6 6l12 12M6 18 18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
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
import WelcomeModal from './components/WelcomeModal.vue';
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
const { isMobile, isDesktop, isTauri } = usePlatform();

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
  isWelcomeModalOpen: showWelcomeModal,
  authModalMode: authModalView,
  openAuthModal,
  closeAuthModal,
  openPurchaseModal,
  closePurchaseModal,
  openWelcomeModal,
  closeWelcomeModal,
  shouldShowWelcomeModal,
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

const handleWelcomeGetStarted = () => {
  closeWelcomeModal();
  openAuthModal('signup');
};

const handleWelcomeClose = () => {
  closeWelcomeModal();
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
      return 'border-[color-mix(in_oklch,var(--color-success-500)_45%,transparent)]';
    case 'error':
      return 'border-[color-mix(in_oklch,var(--color-destructive-500)_40%,transparent)]';
    case 'warning':
      return 'border-[color-mix(in_oklch,var(--color-warning-500)_45%,transparent)]';
    default:
      return 'border-[var(--color-border)]';
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

    // Clear any stale logout flags from old logout-on-close mechanism
    authStore.clearLogoutFlag();

    // Restore existing session from Supabase's persisted storage
    logger.debug('Attempting to restore existing session...');
    const sessionRestoreResult = await authStore.loadCurrentUser();

    logger.debug('Session restore result:', {
      success: sessionRestoreResult.success,
      hasUser: !!sessionRestoreResult.user,
      userEmail: sessionRestoreResult.user?.email,
      error: sessionRestoreResult.error,
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
    window.addEventListener('open-auth-modal', handleOpenAuthModal);
    window.addEventListener('open-purchase-modal', handleOpenPurchaseModal);

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
    
    // Show welcome modal if not authenticated, not in Tauri app, and not previously dismissed
    if (!authStore.isAuthenticated && !isTauri.value && shouldShowWelcomeModal()) {
      logger.debug('Showing welcome modal for first-time visitor');
      // Delay slightly to ensure UI is ready
      setTimeout(() => {
        openWelcomeModal();
      }, 500);
    }
  }
});

onUnmounted(() => {
  if (authUnsubscribe) {
    authUnsubscribe.data.subscription.unsubscribe();
  }
  creditStore.unsubscribeFromChanges();
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('open-auth-modal', handleOpenAuthModal);
  window.removeEventListener('open-purchase-modal', handleOpenPurchaseModal);
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
