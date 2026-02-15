import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SettingsView from '../views/SettingsView.vue';
import GalleryView from '../views/GalleryView.vue';
import PrivacyView from '../views/PrivacyView.vue';
import TermsView from '../views/TermsView.vue';
import MobileAuthScreen from '../views/MobileAuthScreen.vue';
import AuthCallback from '../views/AuthCallback.vue';
import { detectPlatformSync } from '../utils/platformDetection.js';
import { useAuthStore } from '../stores/authStore.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Router');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: GalleryView,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/auth',
    name: 'MobileAuth',
    component: MobileAuthScreen,
    meta: {
      hideNavigation: true, // Hide mobile navigation chrome (top header + bottom nav)
      mobileOnly: true, // This route is only accessible on mobile devices
    },
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: PrivacyView,
  },
  {
    path: '/terms',
    name: 'Terms',
    component: TermsView,
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback,
    meta: {
      hideNavigation: true, // Hide mobile navigation chrome during auth callback
      public: true, // Allow access without authentication (callback processing)
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to protect authenticated routes and handle auth screen access
router.beforeEach(async (to, from, next) => {
  logger.debug('Navigation:', { from: from.path, to: to.path, requiresAuth: to.meta.requiresAuth, mobileOnly: to.meta.mobileOnly, public: to.meta.public });

  // Use synchronous platform detection (critical fix for mobile auth redirect)
  const { isMobile, platform } = detectPlatformSync();
  logger.debug('Platform detected:', { isMobile, platform });

  // Initialize authStore
  let authStore;
  try {
    authStore = useAuthStore();
  } catch (e) {
    logger.error('Failed to initialize authStore:', e);
    if (to.meta.public || to.path === '/') {
      next();
    } else {
      next('/');
    }
    return;
  }

  // CRITICAL: Wait for session restoration to complete before making auth decisions
  logger.debug('Waiting for session restoration...');
  try {
    await authStore.ensureSessionRestored();
    logger.debug('Session restoration complete:', { isAuthenticated: authStore.isAuthenticated, hasUser: !!authStore.user, userEmail: authStore.user?.email });
  } catch (error) {
    logger.error('Session restoration failed:', error);
    // Continue with navigation, treating user as unauthenticated
  }

  // Get current authentication status
  const isAuthenticated = authStore.isAuthenticated;
  logger.debug('Authentication status:', { isAuthenticated, hasUser: !!authStore.user });

  // Redirect unauthenticated mobile users from home to /auth
  if (to.path === '/' && isMobile && !isAuthenticated) {
    logger.info('Redirecting unauthenticated mobile user to /auth');
    next('/auth');
    return;
  }

  // Handle /auth route access control
  if (to.path === '/auth') {
    if (!isMobile) {
      logger.debug('Desktop user attempted to access /auth, redirecting to home');
      next('/');
      return;
    }
    if (isAuthenticated) {
      logger.debug('Authenticated mobile user attempted to access /auth, redirecting to home');
      next('/');
      return;
    }
    logger.debug('Allowing unauthenticated mobile user to access /auth');
    next();
    return;
  }

  // Handle authenticated route protection
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      logger.debug('Unauthenticated user attempted to access protected route:', to.path);
      if (isMobile) {
        next(`/auth?redirect=${encodeURIComponent(to.fullPath)}`);
      } else {
        next('/');
      }
      return;
    }
    logger.debug('Allowing authenticated user to access protected route:', to.path);
    next();
    return;
  }

  // Allow navigation to public routes
  logger.debug('Allowing navigation to:', to.path);
  next();
});

export default router;
