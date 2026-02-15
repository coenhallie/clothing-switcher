<template>
  <div class="desktop-layout">
    <div class="flex min-h-screen flex-col">
      <!-- Header -->
      <header class="desktop-header">
        <div class="container flex items-center justify-between gap-4 py-3">
          <router-link to="/" class="desktop-header__logo">
            <img
              :src="currentLogo"
              alt="SwitchFit Studio"
              class="h-7 w-7 rounded-lg"
              width="28"
              height="28"
            />
            <span class="text-sm font-semibold text-[var(--color-card-foreground)] tracking-tight">
              SwitchFit
            </span>
            <span class="desktop-header__badge">Alpha</span>
          </router-link>

          <nav class="flex items-center gap-0.5">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.to"
              class="desktop-nav__link"
              :class="{ 'desktop-nav__link--active': isRouteActive(item.match) }"
            >
              {{ item.label }}
            </router-link>
          </nav>

          <slot name="header-actions"></slot>
        </div>
      </header>

      <!-- Main -->
      <main class="flex-1 py-6 pb-12">
        <div class="container">
          <slot></slot>
        </div>
      </main>

      <!-- Footer -->
      <footer class="desktop-footer">
        <div class="container flex items-center justify-between gap-4 py-4 text-xs text-[var(--color-muted-foreground)]">
          <span>© {{ currentYear }} SwitchFit Labs</span>
          <div class="flex items-center gap-4">
            <router-link to="/privacy" class="hover:text-[var(--color-card-foreground)] transition">Privacy</router-link>
            <router-link to="/terms" class="hover:text-[var(--color-card-foreground)] transition">Terms</router-link>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../composables/useTheme';
import logoBlack from '../../assets/images/logo-switchfit-black.png';
import logoWhite from '../../assets/images/logo-switchfit-white.png';

const route = useRoute();
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const { isDark } = useTheme();

const currentLogo = computed(() => isDark.value ? logoWhite : logoBlack);

const navigation = computed(() => {
  const baseNavigation = [
    { name: 'TryOn', label: 'Home', to: '/', match: 'TryOn' },
  ];

  if (isAuthenticated.value) {
    baseNavigation.push({
      name: 'Gallery',
      label: 'Gallery',
      to: '/gallery',
      match: 'Gallery',
    });
  }

  return baseNavigation;
});

const isRouteActive = (name) => {
  if (name === 'TryOn') return route.path === '/';
  if (name === 'Gallery') return route.path === '/gallery';
  return route.path.includes(name.toLowerCase());
};

const currentYear = new Date().getFullYear();
</script>

<style scoped>
.desktop-layout {
  position: relative;
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-foreground);
}

.desktop-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.desktop-header__logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.desktop-header__badge {
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  background: var(--color-muted);
  color: var(--color-muted-foreground);
}

.desktop-nav__link {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 450;
  color: var(--color-muted-foreground);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: color 0.15s ease, background 0.15s ease;
}

.desktop-nav__link:hover {
  color: var(--color-card-foreground);
  background: var(--color-muted);
}

.desktop-nav__link--active {
  color: var(--color-card-foreground);
  background: var(--color-muted);
  font-weight: 500;
}

.desktop-footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}
</style>
