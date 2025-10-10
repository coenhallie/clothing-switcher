<template>
  <div class="mobile-layout">
    <!-- Simplified background for mobile -->
    <div class="mobile-layout__background"></div>

    <!-- Mobile Top Header - fixed outside scroll container -->
    <MobileTopHeader v-if="!isAuthRoute" class="mobile-layout__header">
      <template #header-actions>
        <slot name="header-actions"></slot>
      </template>
    </MobileTopHeader>

    <!-- Main Scrollable Content Area -->
    <div class="mobile-layout__scroll-container" :class="{ 'mobile-layout__scroll-container--no-chrome': isAuthRoute }">
      <div class="mobile-layout__content" :class="{ 'mobile-layout__content--no-chrome': isAuthRoute }">
        <slot></slot>
      </div>
    </div>

    <!-- Mobile Bottom Navigation - fixed outside scroll container -->
    <MobileBottomNav v-if="!isAuthRoute" class="mobile-layout__footer" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MobileTopHeader from '../MobileTopHeader.vue'
import MobileBottomNav from '../MobileBottomNav.vue'

const route = useRoute()

/**
 * Check if current route should hide navigation chrome
 * Uses route meta flag (hideNavigation) with fallback to route name check
 * When true, header and bottom nav will be hidden
 */
const isAuthRoute = computed(() => {
  // Primary check: Use meta flag if available
  if (route.meta?.hideNavigation !== undefined) {
    return route.meta.hideNavigation
  }
  // Fallback: Check route name for backwards compatibility
  return route.name === 'MobileAuth'
})

// TODO: Add animation transitions when hiding/showing header and nav
// TODO: Consider safe-area adjustments when components are hidden
// TODO: Future enhancement - add slide/fade animations when chrome visibility changes
</script>

<style scoped>
.mobile-layout {
  position: relative;
  height: 100vh;
  height: 100dvh;
  background-color: var(--color-background);
  color: var(--color-foreground);
  overflow: hidden;
}

.mobile-layout__background {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    180deg,
    color-mix(in oklch, var(--color-brand-500) 8%, transparent) 0%,
    transparent 40%
  );
  pointer-events: none;
}

.mobile-layout__header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
}

.mobile-layout__footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
}

.mobile-layout__scroll-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  
  /* Prevent overscroll bounce */
  overscroll-behavior-y: none;
  -webkit-overscroll-behavior-y: none;
}

.mobile-layout__scroll-container--no-chrome {
  top: 0;
  bottom: 0;
}

.mobile-layout__content {
  padding: 1rem;
  padding-top: calc(64px + env(safe-area-inset-top) + 1rem);
  padding-bottom: calc(64px + env(safe-area-inset-bottom) + 1rem);
  min-height: 100%;
}

.mobile-layout__content--no-chrome {
  padding: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* Ensure proper safe area handling for iOS */
@supports (padding-top: env(safe-area-inset-top)) {
  /* No additional styles needed */
}
</style>