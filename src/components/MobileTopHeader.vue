<template>
  <header
    class="mobile-top-header"
    :style="{
      paddingTop: `calc(${safeAreaTop} + 0.75rem)`,
    }"
  >
    <!-- Logo and Badge -->
    <router-link to="/" class="mobile-top-header__logo">
      <img
        :src="currentLogo"
        alt="SwitchFit Studio"
        class="mobile-top-header__logo-mark"
        width="36"
        height="36"
      />
      <div class="mobile-top-header__logo-copy">
        <span class="mobile-top-header__logo-text">SwitchFit</span>
        <span class="mobile-top-header__logo-subtext">Studio</span>
      </div>
      <span class="mobile-top-header__badge">Alpha</span>
    </router-link>

    <!-- Header Actions Slot (Credits, User Menu, Auth Buttons) -->
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

// Get safe area insets for mobile devices (iOS notch)
const safeAreaInsets = getSafeAreaInsets();
const safeAreaTop = computed(() => safeAreaInsets.top);

/**
 * Computed property to select the appropriate logo based on current theme
 */
const currentLogo = computed(() => isDark.value ? logoWhite : logoBlack);
</script>

<style scoped>
.mobile-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 0.75rem 1rem 0.75rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.1);
  min-height: 3.5rem;
  
  /* Add safe area padding */
  padding-top: calc(0.75rem + env(safe-area-inset-top));
  
  /* Hardware acceleration for smooth rendering */
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

.mobile-top-header__logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.mobile-top-header__logo-mark {
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.9rem;
  background: radial-gradient(
    circle at 30% 30%,
    color-mix(in oklch, var(--color-surface) 65%, transparent),
    transparent 85%
  );
  box-shadow: 0 6px 16px -10px rgba(43, 63, 112, 0.45);
  transform: translateZ(0);
}

.mobile-top-header__logo-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.mobile-top-header__logo-text {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-card-foreground);
  letter-spacing: -0.01em;
}

.mobile-top-header__logo-subtext {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: color-mix(in oklch, var(--color-muted-foreground) 82%, transparent);
}

.mobile-top-header__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-brand-700);
  background: color-mix(in oklch, var(--color-brand-500) 18%, transparent);
  border: 1px solid color-mix(in oklch, var(--color-brand-500) 35%, transparent);
  border-radius: 999px;
}

.mobile-top-header__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 1;
  min-width: 0;
}

/* Dark mode adjustments */
.dark .mobile-top-header {
  background: color-mix(in oklch, var(--color-surface) 95%, transparent);
  box-shadow: 0 2px 12px -2px rgba(0, 0, 0, 0.3);
}

/* Safe area support for iOS */
@supports (padding-top: env(safe-area-inset-top)) {
  .mobile-top-header {
    padding-top: calc(env(safe-area-inset-top) + 0.75rem);
  }
}

/* Responsive adjustments for very small screens */
@media (max-width: 360px) {
  .mobile-top-header__logo-mark {
    width: 2.25rem;
    height: 2.25rem;
  }

  .mobile-top-header__logo-text {
    font-size: 0.875rem;
  }

  .mobile-top-header__logo-subtext {
    font-size: 0.75rem;
  }
  
  .mobile-top-header__badge {
    font-size: 0.625rem;
    padding: 0.0625rem 0.25rem;
  }
}
</style>