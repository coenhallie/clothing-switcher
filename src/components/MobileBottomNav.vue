<template>
  <nav
    class="mobile-bottom-nav"
    :style="{
      paddingBottom: `calc(${safeAreaBottom} + 0.5rem)`,
    }"
  >
    <!-- Navigation Items -->
    <router-link
      v-for="item in visibleNavItems"
      :key="item.path"
      :to="item.path"
      class="mobile-bottom-nav__item"
      :class="{ 'mobile-bottom-nav__item--active': isActive(item.path) }"
      @click="handleTabClick"
    >
      <div class="mobile-bottom-nav__icon">
        <component :is="item.icon" />
      </div>
      <span class="mobile-bottom-nav__label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed, h } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/authStore';
import { usePlatform } from '../composables/usePlatform';
import { useTauriPlugins } from '../composables/useTauriPlugins';

const route = useRoute();
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const { getSafeAreaInsets } = usePlatform();
const { triggerHaptic } = useTauriPlugins();

// Get safe area insets for mobile devices (iOS notch, Android gesture bar)
const safeAreaInsets = getSafeAreaInsets();
const safeAreaBottom = computed(() => safeAreaInsets.bottom);

// SVG Icon components
const HomeIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [
      h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
      h('polyline', { points: '9 22 9 12 15 12 15 22' }),
    ]
  );

const GalleryIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [
      h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
      h('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
      h('polyline', { points: '21 15 16 10 5 21' }),
    ]
  );

// Navigation items (Settings removed)
const navItems = computed(() => {
  const items = [
    {
      path: '/',
      label: 'Home',
      icon: HomeIcon,
      requiresAuth: false,
    },
  ];

  // Only add Gallery if authenticated
  if (isAuthenticated.value) {
    items.push({
      path: '/gallery',
      label: 'Gallery',
      icon: GalleryIcon,
      requiresAuth: true,
    });
  }

  return items;
});

// Filter visible navigation items
const visibleNavItems = computed(() => {
  return navItems.value.filter(
    (item) => !item.requiresAuth || isAuthenticated.value
  );
});

// Check if route is active
const isActive = (path) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

// Handle tab click with haptic feedback
const handleTabClick = async () => {
  // Trigger light haptic feedback for tab selection
  await triggerHaptic('selection', 'light');
};
</script>

<style scoped>
.mobile-bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 -2px 8px -2px rgba(0, 0, 0, 0.1);
  
  /* Add safe area padding */
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  
  /* Hardware acceleration for smooth rendering */
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

.mobile-bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
  padding: 0.375rem 0.5rem;
  border-radius: var(--radius-md);
  color: var(--color-muted-foreground);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  /* Smaller touch target for bottom nav */
  min-height: 48px;
  min-width: 48px;
}

.mobile-bottom-nav__item:active {
  transform: scale(0.95);
  background: color-mix(in oklch, var(--color-muted) 40%, transparent);
}

.mobile-bottom-nav__item--active {
  color: var(--color-brand-600);
  background: color-mix(in oklch, var(--color-brand-500) 12%, transparent);
}

.mobile-bottom-nav__item--active::before {
  content: '';
  position: absolute;
  top: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 2rem;
  height: 3px;
  background: var(--color-brand-500);
  border-radius: 0 0 2px 2px;
}

.mobile-bottom-nav__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.mobile-bottom-nav__icon svg {
  width: 100%;
  height: 100%;
}

.mobile-bottom-nav__label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Dark mode adjustments */
.dark .mobile-bottom-nav {
  background: color-mix(in oklch, var(--color-surface) 95%, transparent);
  box-shadow: 0 -2px 12px -2px rgba(0, 0, 0, 0.3);
}

/* Safe area support for iOS */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .mobile-bottom-nav {
    padding-bottom: calc(env(safe-area-inset-bottom) + 0.5rem);
  }
}
</style>