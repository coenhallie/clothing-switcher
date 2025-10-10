<template>
  <div class="desktop-layout">
    <!-- Background decorations -->
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute inset-0 bg-grid opacity-60"></div>
      <div
        class="absolute -top-48 right-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-indigo-400/40 via-purple-400/30 to-sky-300/20 blur-3xl"
      ></div>
      <div
        class="absolute bottom-[-180px] left-[-60px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-400/25 via-emerald-400/20 to-transparent blur-3xl"
      ></div>
    </div>

    <div class="flex min-h-screen flex-col">
      <!-- Desktop Header -->
      <header
        class="isolate z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-lg"
      >
        <div
          class="container flex flex-wrap items-center justify-between gap-4 py-4"
        >
          <div class="flex items-center gap-3">
            <div>
              <router-link
                to="/"
                class="inline-flex items-center gap-2 text-xl font-semibold tracking-tight text-[var(--color-card-foreground)]"
              >
                <span>SwitchFit Studio</span>
                <span
                  class="rounded-full border border-[color-mix(in_oklch,var(--color-brand-500)_35%,transparent)] bg-[color-mix(in_oklch,var(--color-brand-500)_18%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-700)] shadow-border"
                >
                  Alpha
                </span>
              </router-link>
            </div>
          </div>

          <nav class="flex flex-1 items-center justify-center gap-1">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.to"
              class="relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
              :class="
                isRouteActive(item.match)
                  ? 'bg-[color-mix(in_oklch,var(--color-brand-500)_18%,transparent)] text-[var(--color-brand-600)] shadow-border'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-card-foreground)] hover:bg-[color-mix(in_oklch,var(--color-muted)_45%,transparent)]'
              "
            >
              <span
                class="flex h-2 w-2 rounded-full bg-[var(--color-brand-500)]"
                v-if="isRouteActive(item.match)"
              ></span>
              {{ item.label }}
            </router-link>
          </nav>

          <slot name="header-actions"></slot>
        </div>
      </header>

      <!-- Main Content -->
      <main class="relative flex-1 pb-16 pt-10">
        <div class="container">
          <div class="grid gap-6">
            <section>
              <slot></slot>
            </section>
          </div>
        </div>
      </main>

      <!-- Desktop Footer -->
      <footer
        class="border-t border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-lg"
      >
        <div
          class="container flex flex-wrap items-center justify-between gap-4 py-6 text-sm text-[var(--color-muted-foreground)]"
        >
          <div class="flex items-center gap-2">
            <span>© {{ currentYear }} SwitchFit Labs.</span>
            <span class="hidden sm:inline-flex">All rights reserved.</span>
          </div>
          <div class="flex items-center gap-4">
            <a href="#" class="transition hover:text-[var(--color-brand-500)]"
              >Privacy</a
            >
            <a href="#" class="transition hover:text-[var(--color-brand-500)]"
              >Terms</a
            >
            <a href="#" class="transition hover:text-[var(--color-brand-500)]"
              >Changelog</a
            >
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

const route = useRoute();
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

const navigation = computed(() => {
  const baseNavigation = [
    { name: 'TryOn', label: 'Home', to: '/', match: 'TryOn' },
  ];

  // Only show Gallery if user is authenticated
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
  if (name === 'TryOn') {
    return route.path === '/';
  } else if (name === 'Gallery') {
    return route.path === '/gallery';
  } else {
    return route.path.includes(name.toLowerCase());
  }
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
</style>