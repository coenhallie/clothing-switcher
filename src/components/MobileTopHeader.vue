<template>
  <header
    class="mobile-top-header"
    :style="{ paddingTop: `calc(${safeAreaTop} + 0.5rem)` }"
  >
    <router-link to="/" class="mobile-top-header__logo">
      <img
        :src="currentLogo"
        alt="SwitchFit Studio"
        class="mobile-top-header__logo-mark"
        width="28"
        height="28"
      />
      <span class="mobile-top-header__logo-text">SwitchFit</span>
    </router-link>

    <div class="mobile-top-header__actions">
      <slot name="header-actions"></slot>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { usePlatform } from '../composables/usePlatform';
import { useTheme } from '../composables/useTheme';
import logoBlack from '../assets/images/logo-switchfit-black.png';
import logoWhite from '../assets/images/logo-switchfit-white.png';

const { getSafeAreaInsets } = usePlatform();
const { isDark } = useTheme();

const safeAreaInsets = getSafeAreaInsets();
const safeAreaTop = computed(() => safeAreaInsets.top);

const currentLogo = computed(() => isDark.value ? logoWhite : logoBlack);
</script>

<style scoped>
.mobile-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 0.5rem 0.75rem;
  min-height: 3rem;
  padding-top: calc(0.5rem + env(safe-area-inset-top));
  transform: translate3d(0, 0, 0);
}

.mobile-top-header__logo {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.mobile-top-header__logo-mark {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
}

.mobile-top-header__logo-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-card-foreground);
  letter-spacing: -0.01em;
}

.mobile-top-header__actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 1;
  min-width: 0;
}

@supports (padding-top: env(safe-area-inset-top)) {
  .mobile-top-header {
    padding-top: calc(env(safe-area-inset-top) + 0.5rem);
  }
}
</style>
