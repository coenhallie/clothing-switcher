<template>
  <nav
    class="mobile-bottom-nav"
    :style="{ paddingBottom: `calc(${safeAreaBottom} + 0.375rem)` }"
  >
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

const safeAreaInsets = getSafeAreaInsets();
const safeAreaBottom = computed(() => safeAreaInsets.bottom);

const HomeIcon = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
    h('polyline', { points: '9 22 9 12 15 12 15 22' }),
  ]);

const GalleryIcon = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
    h('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
    h('polyline', { points: '21 15 16 10 5 21' }),
  ]);

const navItems = computed(() => {
  const items = [{ path: '/', label: 'Home', icon: HomeIcon, requiresAuth: false }];
  if (isAuthenticated.value) {
    items.push({ path: '/gallery', label: 'Gallery', icon: GalleryIcon, requiresAuth: true });
  }
  return items;
});

const visibleNavItems = computed(() =>
  navItems.value.filter((item) => !item.requiresAuth || isAuthenticated.value)
);

const isActive = (path) => (path === '/' ? route.path === '/' : route.path.startsWith(path));

const handleTabClick = async () => {
  await triggerHaptic('selection', 'light');
};
</script>

<style scoped>
.mobile-bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 0.375rem 0.75rem;
  padding-bottom: calc(0.375rem + env(safe-area-inset-bottom));
  transform: translate3d(0, 0, 0);
}

.mobile-bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  flex: 1;
  padding: 0.375rem 0.5rem;
  border-radius: var(--radius-md);
  color: var(--color-muted-foreground);
  text-decoration: none;
  transition: color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
}

.mobile-bottom-nav__item:active {
  transform: scale(0.95);
}

.mobile-bottom-nav__item--active {
  color: var(--color-card-foreground);
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
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}
</style>
