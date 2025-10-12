<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-[70] p-4 sm:p-6 animate-fade-in"
    @click="handleDismiss"
  >
    <div
      class="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_48px_100px_-48px_rgba(30,41,59,0.45)] animate-scale-in"
      @click.stop
    >
      <!-- Close Button -->
      <button
        type="button"
        @click="handleDismiss"
        class="absolute right-4 top-4 z-10 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-muted-foreground)] transition hover:border-[var(--color-destructive-500)] hover:text-[var(--color-destructive-500)]"
        aria-label="Close welcome modal"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24">
          <path
            d="M6 6l12 12M6 18 18 6"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <!-- Modal Content -->
      <div class="px-6 py-8 sm:px-8 sm:py-10">
        <!-- Icon/Visual -->
        <div class="flex justify-center mb-6">
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 shadow-soft"
          >
            <svg
              class="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>

        <!-- Heading -->
        <h2
          class="text-center text-2xl font-bold text-[var(--color-card-foreground)] mb-2"
        >
          Welcome to SwitchFit!
        </h2>

        <!-- Subtitle -->
        <p
          class="text-center text-sm text-[var(--color-muted-foreground)] mb-6"
        >
          Transform your wardrobe with AI-powered style
        </p>

        <!-- Offer Card -->
        <div
          class="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)] to-[color-mix(in_oklch,var(--color-brand-500)_6%,transparent)] p-6 mb-6"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-500)] shadow-soft"
            >
              <svg
                class="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="flex-1">
              <p
                class="text-lg font-bold text-[var(--color-card-foreground)]"
              >
                Get 2 Free Credits
              </p>
              <p class="text-sm text-[var(--color-muted-foreground)]">
                When you sign up today
              </p>
            </div>
          </div>
          <p class="text-sm text-[var(--color-card-foreground)] leading-relaxed">
            Start exploring AI-powered clothing transformations instantly. Each credit lets you generate one unique style variation.
          </p>
        </div>

        <!-- CTA Button -->
        <button
          @click="handleGetStarted"
          class="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-95"
        >
          Get Started Free
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path
              d="M13 7l5 5m0 0-5 5m5-5H6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <!-- Skip Link -->
        <button
          @click="handleDismiss"
          class="mt-4 w-full text-center text-sm text-[var(--color-muted-foreground)] transition hover:text-[var(--color-card-foreground)]"
        >
          I'll explore on my own
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'get-started']);

const handleDismiss = () => {
  emit('close');
};

const handleGetStarted = () => {
  emit('get-started');
};
</script>