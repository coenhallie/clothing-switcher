import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SettingsView from '../views/SettingsView.vue';
import GalleryView from '../views/GalleryView.vue';
import MobileAuthScreen from '../views/MobileAuthScreen.vue';
import AuthCallback from '../views/AuthCallback.vue';
import { detectPlatformSync } from '../utils/platformDetection.js';
import { useAuthStore } from '../stores/authStore.js';

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
  console.log('[Router Guard] Navigation:', {
    from: from.path,
    to: to.path,
    requiresAuth: to.meta.requiresAuth,
    mobileOnly: to.meta.mobileOnly,
    public: to.meta.public
  });

  // Use synchronous platform detection (critical fix for mobile auth redirect)
  const { isMobile, platform } = detectPlatformSync();
  console.log('[Router Guard] Platform detected:', { isMobile, platform });

  // Initialize authStore
  let authStore;
  try {
    authStore = useAuthStore();
  } catch (e) {
    console.error('[Router Guard] Failed to initialize authStore:', e);
    // If authStore fails, allow navigation to public routes only
    if (to.meta.public || to.path === '/') {
      next();
    } else {
      next('/');
    }
    return;
  }

  // CRITICAL: Wait for session restoration to complete before making auth decisions
  console.log('[Router Guard] Waiting for session restoration...');
  try {
    await authStore.ensureSessionRestored();
    console.log('[Router Guard] Session restoration complete:', {
      isAuthenticated: authStore.isAuthenticated,
      hasUser: !!authStore.user,
      userEmail: authStore.user?.email
    });
  } catch (error) {
    console.error('[Router Guard] Session restoration failed:', error);
    // Continue with navigation, treating user as unauthenticated
  }

  // Get current authentication status (fixes hardcoded isAuthenticated = false bug)
  const isAuthenticated = authStore.isAuthenticated;
  console.log('[Router Guard] Authentication status:', {
    isAuthenticated,
    hasUser: !!authStore.user,
    userEmail: authStore.user?.email
  });

  // CRITICAL FIX: Redirect unauthenticated mobile users from home to /auth
  if (to.path === '/' && isMobile && !isAuthenticated) {
    console.log('[Router Guard] CRITICAL REDIRECT: Unauthenticated mobile user at /, redirecting to /auth');
    next('/auth');
    return;
  }

  // Handle /auth route access control
  if (to.path === '/auth') {
    // Prevent desktop users from accessing mobile-only auth screen
    if (!isMobile) {
      console.log('[Router Guard] Desktop user attempted to access /auth, redirecting to home');
      next('/');
      return;
    }

    // Redirect authenticated mobile users away from auth screen
    if (isAuthenticated) {
      console.log('[Router Guard] Authenticated mobile user attempted to access /auth, redirecting to home');
      next('/');
      return;
    }

    // Allow unauthenticated mobile users to access auth screen
    console.log('[Router Guard] Allowing unauthenticated mobile user to access /auth');
    next();
    return;
  }

  // Handle authenticated route protection
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      console.log('[Router Guard] Unauthenticated user attempted to access protected route:', to.path);
      
      if (isMobile) {
        // Redirect to mobile auth screen with return URL
        console.log('[Router Guard] Redirecting mobile user to /auth with redirect param');
        next(`/auth?redirect=${encodeURIComponent(to.fullPath)}`);
      } else {
        // Redirect desktop users to home (desktop modal will handle auth)
        console.log('[Router Guard] Redirecting desktop user to home (modal will handle auth)');
        next('/');
      }
      return;
    }

    // Allow authenticated users to access protected routes
    console.log('[Router Guard] Allowing authenticated user to access protected route:', to.path);
    next();
    return;
  }

  // Allow navigation to public routes
  console.log('[Router Guard] Allowing navigation to public route:', to.path);
  next();
});

export default router;
