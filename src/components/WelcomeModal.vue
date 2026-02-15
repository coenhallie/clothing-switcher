<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4 animate-fade-in"
    @click="handleDismiss"
  >
    <div
      class="welcome-panel animate-scale-in"
      @click.stop
    >
      <!-- Close -->
      <button
        type="button"
        @click="handleDismiss"
        class="welcome-panel__close"
        aria-label="Close"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
          <path d="M6 6l12 12M6 18 18 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <!-- Content -->
      <div class="welcome-panel__body">
        <div class="welcome-panel__icon">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>

        <h2 class="text-lg font-semibold text-[var(--color-card-foreground)] text-center">
          Welcome to SwitchFit
        </h2>
        <p class="text-xs text-[var(--color-muted-foreground)] text-center">
          AI-powered virtual try-on
        </p>

        <!-- Offer -->
        <div class="welcome-panel__offer">
          <div class="flex items-center gap-2.5">
            <div class="welcome-panel__offer-icon">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <path d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-[var(--color-card-foreground)]">2 free credits</p>
              <p class="text-[11px] text-[var(--color-muted-foreground)]">When you sign up today</p>
            </div>
          </div>
          <p class="text-xs text-[var(--color-muted-foreground)] mt-2 leading-relaxed">
            Each credit generates one unique outfit variation from your photos.
          </p>
        </div>

        <!-- CTA -->
        <button @click="handleGetStarted" class="welcome-panel__cta">
          Get started
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
            <path d="M13 7l5 5m0 0-5 5m5-5H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <button @click="handleDismiss" class="welcome-panel__skip">
          Skip for now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'get-started']);

const handleDismiss = () => emit('close');
const handleGetStarted = () => emit('get-started');
</script>

<style scoped>
.welcome-panel {
  position: relative;
  width: min(380px, 100%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-elevated);
  overflow: hidden;
}

.welcome-panel__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-sm);
  color: var(--color-muted-foreground);
  transition: color 0.15s ease, background 0.15s ease;
}

.welcome-panel__close:hover {
  color: var(--color-card-foreground);
  background: var(--color-muted);
}

.welcome-panel__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem 1.5rem;
  gap: 0.375rem;
}

.welcome-panel__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  background: var(--color-foreground);
  color: var(--color-background);
  margin-bottom: 0.5rem;
}

.welcome-panel__offer {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-top: 0.75rem;
}

.welcome-panel__offer-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  background: var(--color-muted);
  color: var(--color-card-foreground);
  flex-shrink: 0;
}

.welcome-panel__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: 100%;
  padding: 0.625rem 1rem;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--color-foreground);
  color: var(--color-background);
  border-radius: var(--radius-md);
  transition: opacity 0.15s ease;
}

.welcome-panel__cta:hover {
  opacity: 0.88;
}

.welcome-panel__skip {
  padding: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-muted-foreground);
  transition: color 0.15s ease;
}

.welcome-panel__skip:hover {
  color: var(--color-card-foreground);
}
</style>
